---
title: A Professional ASP.NET Core API - Background Task
date: September 15 2020
category: aspnetcore-api
tags:
    - dotnet
    - aspnetcore
    - webapi
    - backgroundtask
    - hostedservices
---

In `ASP.NET Core`, background tasks can be implemented as `hosted services`. A hosted service is a class with background task logic that implements the `IHostedService` interface. This topic provides three hosted service examples:

* Background task that runs on a timer.
* Hosted service that activates a scoped service. The scoped service can use dependency injection (DI).
* Queued background tasks that run sequentially.

<!-- more -->

## IHostedService interface

The `IHostedService` interface defines two methods for objects that are managed by the host:

**StartAsync(CancellationToken)**: `StartAsync` contains the logic to start the background task. `StartAsync` is called before:

* The app's request processing pipeline is configured (Startup.Configure).
* The server is started and `IApplicationLifetime.ApplicationStarted` is triggered.
The default behavior can be changed so that the hosted service's `StartAsync` runs after the app's pipeline has been configured and ApplicationStarted is called.

**StopAsync(CancellationToken)**: Triggered when the host is performing a graceful shutdown. `StopAsync` contains the logic to end the background task. Implement IDisposable and finalizers (destructors) to dispose of any unmanaged resources.

The cancellation token has a default five second timeout to indicate that the shutdown process should no longer be graceful. When cancellation is requested on the token:

* Any remaining background operations that the app is performing should be aborted.
* Any methods called in `StopAsync` should return promptly.

However, tasks aren't abandoned after cancellation is requested—the caller awaits all tasks to complete.

If the app shuts down unexpectedly, `StopAsync` might not be called. Therefore, any methods called or operations conducted in `StopAsync` might not occur.

```cs
using Microsoft.Extensions.Hosting;
using System.Threading;
using System.Threading.Tasks;

public class SampleHostedService : IHostedService
{
	public Task StartAsync(CancellationToken cancellationToken)
	{
	}
	
	public Task StopAsync(CancellationToken cancellationToken)
	{
	}
}
```

## BackgroundService base class

`BackgroundService` is a base class for implementing a long running `IHostedService`.

`ExecuteAsync(CancellationToken)` is called to run the background service. The implementation returns a Task that represents the entire lifetime of the background service. No further services are started until `ExecuteAsync` becomes asynchronous, such as by calling await. Avoid performing long, blocking initialization work in `ExecuteAsync`. The host blocks in StopAsync(CancellationToken) waiting for `ExecuteAsync` to complete.

The cancellation token is triggered when IHostedService.StopAsync is called. Your implementation of `ExecuteAsync` should finish promptly when the cancellation token is fired in order to gracefully shut down the service. Otherwise, the service ungracefully shuts down at the shutdown timeout. For more information, see the IHostedService interface section.

```cs
using Microsoft.Extensions.Hosting;
using System.Threading;
using System.Threading.Tasks;

public class SampleBackgroundService : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken cancellationToken)
    {
       
    }
}
```

## Background task that runs on a timer

A timed background task makes use of the `System.Threading.Timer` class. The timer triggers the task's `DoWork` method. The timer is disabled on `StopAsync` and disposed when the service container is disposed on `Dispose`:

```cs
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace TaskBg.Controllers
{
    public class TimedHostedService : IHostedService, IDisposable
    {
        private int executionCount = 0;
        private readonly ILogger<TimedHostedService> _logger;
        private Timer _timer;

        public TimedHostedService(ILogger<TimedHostedService> logger)
        {
            _logger = logger;
        }

        public Task StartAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Timed Hosted Service running.");

            _timer = new Timer(DoWork, null, TimeSpan.Zero,
                TimeSpan.FromSeconds(5));

            return Task.CompletedTask;
        }

        private void DoWork(object state)
        {
            var count = Interlocked.Increment(ref executionCount);

            _logger.LogInformation(
                "Timed Hosted Service is working. Count: {Count}", count);
        }

        public Task StopAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Timed Hosted Service is stopping.");

            _timer?.Change(Timeout.Infinite, 0);

            return Task.CompletedTask;
        }

        public void Dispose()
        {
            _timer?.Dispose();
        }
    }
}
```

The `Timer` doesn't wait for previous executions of `DoWork` to finish, so the approach shown might not be suitable for every scenario. `Interlocked.Increment` is used to increment the execution counter as **an atomic operation**, which ensures that multiple threads **don't** update `executionCount` concurrently.

The service is registered in:

```cs
// Startup.ConfigureServices

public void ConfigureServices(IServiceCollection services)
{
    services.AddControllers();
    
    // HERE
    services.AddHostedService<TimedHostedService>();
}

// OR
// Program.cs

public class Program
{
    public static void Main(string[] args)
    {
        CreateHostBuilder(args).Build().Run();
    }

    public static IHostBuilder CreateHostBuilder(string[] args) =>
        Host.CreateDefaultBuilder(args)
            .ConfigureWebHostDefaults(webBuilder =>
            {
                webBuilder.UseStartup<Startup>();
            })
            .ConfigureServices(services =>
            {
                // HERE
                services.AddHostedService<VideosWatcher>();
            });
}
```

## Consuming a scoped service in a background task

To use `scoped services` within a `BackgroundService`, create a scope. No scope is created for a hosted service by default.

The scoped background task service contains the background task's logic. In the following example:

The service is asynchronous. The `DoWork` method returns a `Task`. For demonstration purposes, a delay of ten seconds is awaited in the `DoWork` method.
An `ILogger` is injected into the service.

```cs
internal interface IScopedProcessingService
{
    Task DoWork(CancellationToken stoppingToken);
}

internal class ScopedProcessingService : IScopedProcessingService
{
    private int executionCount = 0;
    private readonly ILogger _logger;
    
    public ScopedProcessingService(ILogger<ScopedProcessingService> logger)
    {
        _logger = logger;
    }

    public async Task DoWork(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            executionCount++;

            _logger.LogInformation(
                "Scoped Processing Service is working. Count: {Count}", executionCount);

            await Task.Delay(10000, stoppingToken);
        }
    }
}
```

The hosted service creates a scope to resolve the scoped background task service to call its `DoWork` method. `DoWork` returns a `Task`, which is awaited in `ExecuteAsync`:

```cs
public class ConsumeScopedServiceHostedService : BackgroundService
{
    private readonly ILogger<ConsumeScopedServiceHostedService> _logger;

    public ConsumeScopedServiceHostedService(IServiceProvider services, 
        ILogger<ConsumeScopedServiceHostedService> logger)
    {
        Services = services;
        _logger = logger;
    }

    public IServiceProvider Services { get; }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation(
            "Consume Scoped Service Hosted Service running.");

        await DoWork(stoppingToken);
    }

    private async Task DoWork(CancellationToken stoppingToken)
    {
        _logger.LogInformation(
            "Consume Scoped Service Hosted Service is working.");

        using (var scope = Services.CreateScope())
        {
            var scopedProcessingService = 
                scope.ServiceProvider
                    .GetRequiredService<IScopedProcessingService>();

            await scopedProcessingService.DoWork(stoppingToken);
        }
    }

    public override async Task StopAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation(
            "Consume Scoped Service Hosted Service is stopping.");

        await base.StopAsync(stoppingToken);
    }
}
```

The services are registered in `IHostBuilder.ConfigureServices` (Program.cs). The hosted service is registered with the `AddHostedService` extension method:

```cs
// Program.IHostBuilder.ConfigureServices
// Or
// // Startup.ConfigureServices

services.AddHostedService<ConsumeScopedServiceHostedService>();
services.AddScoped<IScopedProcessingService, ScopedProcessingService>();
```

## Queued background tasks

A background task queue is based on the .NET 4.x `QueueBackgroundWorkItem`:

```cs
public interface IBackgroundTaskQueue
{
    void QueueBackgroundWorkItem(Func<CancellationToken, Task> workItem);

    Task<Func<CancellationToken, Task>> DequeueAsync(
        CancellationToken cancellationToken);
}

public class BackgroundTaskQueue : IBackgroundTaskQueue
{
    private ConcurrentQueue<Func<CancellationToken, Task>> _workItems = 
        new ConcurrentQueue<Func<CancellationToken, Task>>();
    private SemaphoreSlim _signal = new SemaphoreSlim(0);

    public void QueueBackgroundWorkItem(
        Func<CancellationToken, Task> workItem)
    {
        if (workItem == null)
        {
            throw new ArgumentNullException(nameof(workItem));
        }

        _workItems.Enqueue(workItem);
        _signal.Release();
    }

    public async Task<Func<CancellationToken, Task>> DequeueAsync(
        CancellationToken cancellationToken)
    {
        await _signal.WaitAsync(cancellationToken);
        _workItems.TryDequeue(out var workItem);

        return workItem;
    }
}
```

In the following `QueueHostedService` example:

The `BackgroundProcessing` method returns a `Task`, which is awaited in `ExecuteAsync`.
Background tasks in the queue are dequeued and executed in `BackgroundProcessing`.
Work items are awaited before the service stops in `StopAsync`.

```cs
public class QueuedHostedService : BackgroundService
{
    private readonly ILogger<QueuedHostedService> _logger;

    public QueuedHostedService(IBackgroundTaskQueue taskQueue, 
        ILogger<QueuedHostedService> logger)
    {
        TaskQueue = taskQueue;
        _logger = logger;
    }

    public IBackgroundTaskQueue TaskQueue { get; }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation(
            $"Queued Hosted Service is running.{Environment.NewLine}" +
            $"{Environment.NewLine}Tap W to add a work item to the " +
            $"background queue.{Environment.NewLine}");

        await BackgroundProcessing(stoppingToken);
    }

    private async Task BackgroundProcessing(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            var workItem = 
                await TaskQueue.DequeueAsync(stoppingToken);

            try
            {
                await workItem(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, 
                    "Error occurred executing {WorkItem}.", nameof(workItem));
            }
        }
    }

    public override async Task StopAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Queued Hosted Service is stopping.");

        await base.StopAsync(stoppingToken);
    }
}
```

A `MonitorLoop` service handles enqueuing tasks for the hosted service whenever the `w` key is selected on an input device:

* The `IBackgroundTaskQueue` is injected into the `MonitorLoop` service.
* `IBackgroundTaskQueue.QueueBackgroundWorkItem` is called to enqueue a work item.
* The work item simulates a long-running background task:
    * Three 5-second delays are executed (`Task.Delay`).
    * A try-catch statement traps `OperationCanceledException` if the task is cancelled.

```cs
public class MonitorLoop
{
    private readonly IBackgroundTaskQueue _taskQueue;
    private readonly ILogger _logger;
    private readonly CancellationToken _cancellationToken;

    public MonitorLoop(IBackgroundTaskQueue taskQueue, 
        ILogger<MonitorLoop> logger, 
        IHostApplicationLifetime applicationLifetime)
    {
        _taskQueue = taskQueue;
        _logger = logger;
        _cancellationToken = applicationLifetime.ApplicationStopping;
    }

    public void StartMonitorLoop()
    {
        _logger.LogInformation("Monitor Loop is starting.");

        // Run a console user input loop in a background thread
        Task.Run(() => Monitor());
    }

    public void Monitor()
    {
        while (!_cancellationToken.IsCancellationRequested)
        {
            var keyStroke = Console.ReadKey();

            if (keyStroke.Key == ConsoleKey.W)
            {
                // Enqueue a background work item
                _taskQueue.QueueBackgroundWorkItem(async token =>
                {
                    // Simulate three 5-second tasks to complete
                    // for each enqueued work item

                    int delayLoop = 0;
                    var guid = Guid.NewGuid().ToString();

                    _logger.LogInformation(
                        "Queued Background Task {Guid} is starting.", guid);

                    while (!token.IsCancellationRequested && delayLoop < 3)
                    {
                        try
                        {
                            await Task.Delay(TimeSpan.FromSeconds(5), token);
                        }
                        catch (OperationCanceledException)
                        {
                            // Prevent throwing if the Delay is cancelled
                        }

                        delayLoop++;

                        _logger.LogInformation(
                            "Queued Background Task {Guid} is running. " +
                            "{DelayLoop}/3", guid, delayLoop);
                    }

                    if (delayLoop == 3)
                    {
                        _logger.LogInformation(
                            "Queued Background Task {Guid} is complete.", guid);
                    }
                    else
                    {
                        _logger.LogInformation(
                            "Queued Background Task {Guid} was cancelled.", guid);
                    }
                });
            }
        }
    }
}
```

The services are registered in `IHostBuilder.ConfigureServices` (Program.cs). The hosted service is registered with the `AddHostedService` extension method:

```cs
// Program.IHostBuilder.ConfigureServices
// Or
// // Startup.ConfigureServices

services.AddSingleton<MonitorLoop>();
services.AddHostedService<QueuedHostedService>();
services.AddSingleton<IBackgroundTaskQueue, BackgroundTaskQueue>();
```

`MonitorLoop` is started in `Program.Main`:

```cs
var monitorLoop = host.Services.GetRequiredService<MonitorLoop>();
monitorLoop.StartMonitorLoop();
```

## Quartz.net scheduler 

You are able to write any background services with the above approach but there are another options to do your background jobs via a scheduler.

`Quartz.net` is an open-source job scheduling system for .NET and you can integrate as following:

Install the below packages

```bash
Install-Package Quartz -Version 3.1.0
dotnet add package Quartz --version 3.1.0
<PackageReference Include="Quartz" Version="3.1.0" />

Install-Package Quartz.AspNetCore -Version 3.1.0
dotnet add package Quartz.AspNetCore --version 3.1.0
<PackageReference Include="Quartz.AspNetCore" Version="3.1.0" />
```

```cs
// ExampleJob.cs

public class ExampleJob : IJob
{
    public async Task Execute(IJobExecutionContext context)
    {
        await Console.Out.WriteLineAsync("Greetings from HelloJob!").ConfigureAwait(false);
    }
}

// Startup.ConfigureServices

public void ConfigureServices(IServiceCollection services)
{
    services.AddControllers();

    // base configuration for DI
    services.AddQuartz(q =>
    {
        // handy when part of cluster or you want to otherwise identify multiple schedulers
        q.SchedulerId = "Scheduler-Core";

        // we take this from appsettings.json, just show it's possible
        // q.SchedulerName = "Quartz ASP.NET Core Sample Scheduler";

        // we could leave DI configuration intact and then jobs need to have public no-arg constructor
        // the MS DI is expected to produce transient job instances 
        q.UseMicrosoftDependencyInjectionJobFactory(options =>
        {
            // if we don't have the job in DI, allow fallback to configure via default constructor
            options.AllowDefaultConstructor = true;
        });

        // or 
        // q.UseMicrosoftDependencyInjectionScopedJobFactory();

        // these are the defaults
        q.UseSimpleTypeLoader();
        q.UseInMemoryStore();
        q.UseDefaultThreadPool(tp =>
        {
            tp.MaxConcurrency = 10;
        });

        // configure jobs with code
        var jobKey = new JobKey("awesome job", "awesome group");
        q.AddJob<ExampleJob>(j => j
            .StoreDurably()
            .WithIdentity(jobKey)
            .WithDescription("my awesome job")
        );

        q.AddTrigger(t => t
            .WithIdentity("Simple Trigger")
            .ForJob(jobKey)
            .StartNow()
            .WithSimpleSchedule(x => x.WithInterval(TimeSpan.FromSeconds(1)).RepeatForever())
            .WithDescription("my awesome simple trigger")
        );

    });

    services.AddQuartzServer(options =>
    {
        // when shutting down we want jobs to complete gracefully
        options.WaitForJobsToComplete = true;
    });
}
```

## Quartz.net Admin UI

**Quartzmin**

Site: https://github.com/jlucansky/Quartzmin

**CrystalQuartz**

Site: https://github.com/guryanovev/CrystalQuartz

## Quartz alternative

**FluentScheduler**

Automated job scheduler with fluent interface for the .NET platform.

Site: https://github.com/fluentscheduler/FluentScheduler

## Reference(s)

Most of the information in this article has gathered from various references.

* https://docs.microsoft.com/en-us/aspnet/core/fundamentals/host/hosted-services
* https://andrewlock.net/creating-a-quartz-net-hosted-service-with-asp-net-core/
* https://www.infoworld.com/article/3529418/how-to-schedule-jobs-using-quartznet-in-aspnet-core.html
* https://thinkrethink.net/2018/05/31/run-scheduled-background-tasks-in-asp-net-core/
* https://www.stevejgordon.co.uk/asp-net-core-2-ihostedservice
* https://medium.com/@nickfane/introduction-to-worker-services-in-net-core-3-0-4bb3fc631225
* https://www.quartz-scheduler.net/
* https://github.com/quartznet/quartznet/tree/master/src/Quartz.Examples.AspNetCore
* https://girishgodage.in/blog/customize-hostedservices