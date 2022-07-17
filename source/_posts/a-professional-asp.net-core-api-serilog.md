---
title: A Professional ASP.NET Core API - Serilog
date: September 28 2020
category: aspnetcore-api
tags:
    - dotnet
    - aspnetcore
    - webapi
    - log
---

`Serilog` is an alternative logging implementation that plugs into ASP.NET Core. It supports the same structured logging APIs, and receives log events from the ASP.NET Core framework class libraries, but adds a stack of features that make it a more appealing choice for some kinds of apps and environments.

<!-- more -->

Install the below packages

```bash
Install-Package Serilog.AspNetCore -Version 3.4.0
dotnet add package Serilog.AspNetCore --version 3.4.0
<PackageReference Include="Serilog.AspNetCore" Version="3.4.0" />
```

## Serilog Enrichers

To enable Structured Logging and to unleash the full potential of `Serilog`, we use `enrichers`. These enrichers give you additional details like Machine Name, ProcessId, Thread Id when the log event had occurred for better diagnostics. It makes a developer’s life quite simpler..

## Serilog Sinks

Serilog `Sinks` in simpler words relate to destinations for logging the data. In the packages that we are going to install to our ASP.NET Core application, Sinks for `Console` and `File` are included out of the box. That means we can write logs to Console and File System without adding any extra packages. Serilog supports various other destinations like `MSSQL`, `SQLite`, `SEQ` and more.

## Logger Initialization

Exceptions thrown during start-up are some of the most disruptive errors your application might face, and so the very first line of code in our Serilog-enabled app will set up logging and make sure any nasties are caught and recorded.

```cs
public class Program
{
    public static void Main(string[] args)
    {
        // HERE
        Log.Logger = new LoggerConfiguration()
            .Enrich.FromLogContext() /*Enricher*/
            .WriteTo.Console() /*Sink*/
            .CreateLogger();
        try
        {
            Log.Information("Starting up");
            CreateHostBuilder(args).Build().Run();
        }
        catch (Exception ex)
        {
            Log.Fatal(ex, "Application start-up failed");
        }
        finally
        {
            Log.CloseAndFlush();
        }
    }
    public static IHostBuilder CreateHostBuilder(string[] args) =>
        Host.CreateDefaultBuilder(args)

            // HERE
            //Uses Serilog instead of default .NET Logger
            .UseSerilog()
            .ConfigureWebHostDefaults(webBuilder =>
            {
                webBuilder.UseStartup<Startup>();
            });
}
```

**Cleaning the default logger**

The "Logging" section that you’ll find in `appsettings.json` isn't used by `Serilog`, and can be removed:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft": "Warning",
      "Microsoft.Hosting.Lifetime": "Information"
    }
  },
  "AllowedHosts": "*"
}
```

After cleaning up here, the configuration looks like this:

```json
{
  "AllowedHosts": "*"
}
```

## Writing your own log events

You should use `ILogger<T>` to log your own events as following

```cs
public class HomeController : Controller
{
    private readonly ILogger<HomeController> _logger;

    public HomeController(ILogger<HomeController> logger)
    {
        _logger = logger;
    }

    public IActionResult Index([FromQuery] string name)
    {
        _logger.LogInformation("Hello, {Name}!", name);
        return View();
    } 
}
```

## Log Levels

I also wanted you to know about the various Logging Levels. This is the fundamental concept of logging. When we wrote `_logger.LogInformation("Hello, {Name}!", name);`, we mentioned to the application that this is a log with the log-level set to `Information`. Log levels make sense because it allows you to define the type of log. Is it a critical log? just a debug message? a warning message?

There are 7 log-levels included :

* `Trace`: Detailed messages with sensitive app data.
* `Debug`: Useful for the development environment.
* `Information`: General messages, like the way we mentioned earlier.
* `Warning`: For unexpected events.
* `Error`: For exceptions and errors.
* `Critical`: For failures that may need immediate attention.


## Streamlined request logging

Our log output will now be rather quiet. We didn’t want a dozen log events per request, but chances are, we’ll need to know what requests the app is handling in order to do most diagnostic analysis.

To switch request logging back on, we’ll add `Serilog` to the app's middleware pipeline over in `Startup.cs`. You’ll find a `Configure()` method in there like the following:

```cs
public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
{
    if (env.IsDevelopment())
    {
        app.UseDeveloperExceptionPage();
    }
    else
    {
        app.UseExceptionHandler("/Home/Error");
        app.UseHsts();
    }
    app.UseHttpsRedirection();
    app.UseStaticFiles();

    // HERE
    app.UseSerilogRequestLogging();

    app.UseRouting();
    app.UseAuthorization();
    app.UseEndpoints(endpoints =>
    {
        endpoints.MapControllerRoute(
            name: "default",
            pattern: "{controller=Home}/{action=Index}/{id?}");
    });
}
```

We'll be a bit tactical about where we add `Serilog` into the pipeline. I tend not to want request logging for static files, so I add `UseSerilogRequestLogging()` **later** in the pipeline, as shown above.

## Read from configuration

Change `Program.Main()` as following

```cs
// Program.cs
public static void Main(string[] args)
{
    // HERE
    //Read Configuration from appSettings
    var config = new ConfigurationBuilder()
        .SetBasePath(Directory.GetCurrentDirectory())
        .AddJsonFile("appsettings.json")
        .Build();

    Log.Logger = new LoggerConfiguration()
        .MinimumLevel.Debug() // <- Set the minimum level
        .Enrich.FromLogContext()
        .Enrich.WithMachineName()
        .Enrich.WithProcessId()
        .Enrich.WithThreadId()
        .Enrich.WithCorrelationId()
        .WriteTo.Console()
        /*HERE*/
        .ReadFrom.Configuration(config)
        .CreateLogger();
    try
    {
        Log.Information("Starting up");
        CreateHostBuilder(args).Build().Run();
    }
    catch (Exception ex)
    {
        Log.Fatal(ex, "Application start-up failed");
    }
    finally
    {
        Log.CloseAndFlush();
    }
}
```

**Setting up Serilog**

Add `Serilog` section to `appsettings.json`

```json
{
  "AllowedHosts": "*",
  "Serilog": 
  {
    "Using":  [ "Serilog.Sinks.Console", "Serilog.Sinks.File" ],
    "MinimumLevel": {
      "Default": "Debug",
      "Override": 
      {
        "Microsoft": "Warning",
        "System": "Warning"
      }
    },
    "WriteTo": [
      {
        "Name": "Console"
      },
      {
        "Name": "File",
        "Args": {
          "path": "D:\\Logs\\log.txt",
          "outputTemplate": "{Timestamp} {Message}{NewLine:1}{Exception:1}"
        }
      }
    ],
    "Destructure": [
      { "Name": "With", "Args": { "policy": "Sample.CustomPolicy, Sample" } },
      { "Name": "ToMaximumDepth", "Args": { "maximumDestructuringDepth": 4 } },
      { "Name": "ToMaximumStringLength", "Args": { "maximumStringLength": 100 } },
      { "Name": "ToMaximumCollectionCount", "Args": { "maximumCollectionCount": 10 } }
    ],
    "Enrich": [
      "FromLogContext",
      "WithMachineName",
      "WithProcessId",
      "WithThreadId"
    ],
    "Properties": {
      "ApplicationName": "Serilog.WebApplication"
    }
  }
}
```

## Useful Enrichers

Here's how to add some of the most useful enrichers.

```bash
Install-Package Serilog.Enrichers.Environment -Version 2.1.3
dotnet add package Serilog.Enrichers.Environment --version 2.1.3
<PackageReference Include="Serilog.Enrichers.Environment" Version="2.1.3" />

Install-Package Serilog.Enrichers.Process -Version 2.0.2-dev-00731
dotnet add package Serilog.Enrichers.Process --version 2.0.2-dev-00731
<PackageReference Include="Serilog.Enrichers.Process" Version="2.0.2-dev-00731" />

Install-Package Serilog.Enrichers.Thread -Version 3.2.0-dev-00747
dotnet add package Serilog.Enrichers.Thread --version 3.2.0-dev-00747
<PackageReference Include="Serilog.Enrichers.Thread" Version="3.2.0-dev-00747" />

Install-Package Serilog.Enrichers.CorrelationId -Version 3.0.1
dotnet add package Serilog.Enrichers.CorrelationId --version 3.0.1
<PackageReference Include="Serilog.Enrichers.CorrelationId" Version="3.0.1" />
```

Change your `Program.Main()` as following

```cs
// HERE
var config = new ConfigurationBuilder()
    .AddJsonFile("appsettings.json")
    .Build();
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Verbose()
    .Enrich.FromLogContext()
    // Serilog.Enrichers.Environment
    .Enrich.WithMachineName()
    .Enrich.WithEnvironmentUserName()
    // Serilog.Enrichers.Process
    .Enrich.WithProcessId()
    .Enrich.WithProcessName()
    // Serilog.Enrichers.Thread
    .Enrich.WithThreadId()
    .Enrich.WithThreadName()
    // The {ThreadName} property will only be attached when it is not null. Otherwise it will be omitted. If you want to get this property always attached you can use the following:
    .Enrich.WithProperty(ThreadNameEnricher.ThreadNamePropertyName, "MyDefault")
    // Serilog.Enrichers.CorrelationId
    .Enrich.WithCorrelationId()
    // Change the output template to as following, {Properties} placeholder Collects and displays all of the above enrichers.
    .WriteTo.Console(outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj} {Properties}{NewLine}{Exception}")
    .ReadFrom.Configuration(config)
    .CreateLogger();
```

For `Serilog.Enrichers.CorrelationId`, you need to add `AddHttpContextAccessor` too.

```cs
// Startup.ConfigureServices
public void ConfigureServices(IServiceCollection services)
{
    services.AddControllers();
    // HERE
    services.AddHttpContextAccessor();
}
```

## Enrich from global properties

You can also specify properties globally. In some cases, we need to calculate properties on startup, which can be done using the Fluent API:

```cs
Log.Logger = new LoggerConfiguration()
    .Enrich.FromLogContext()
    // HERE
    .Enrich.WithProperty("Version", typeof(Program).Assembly.GetName().Version)
    // 'Version' is accessible via {Properties}
    .WriteTo.Console(outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj} {Properties}{NewLine}{Exception}")
    .CreateLogger();
```

## Timings

Serilog's support for structured data makes it a great way to collect timing information. It's easy to get started with in development, because the timings are printed to the same output as other log messages (the console, files, etc.) so a metrics server doesn't have to be available all the time.

`Serilog Timings` is built with some specific requirements in mind:

One operation produces exactly one log event (events are raised at the completion of an operation)
Natural and fully-templated messages
Events for a single operation have a single event type, across both success and failure cases (only the logging level and Outcome properties change)
This keeps noise in the log to a minimum, and makes it easy to extract and manipulate timing information on a per-operation basis.

Install below packages

```bash
Install-Package SerilogTimings -Version 2.3.0
dotnet add package SerilogTimings --version 2.3.0
<PackageReference Include="SerilogTimings" Version="2.3.0" />
```

The simplest use case is to time an operation, without explicitly recording success/failure:

```cs
using (Operation.Time("Submitting payment for {OrderId}", order.Id))
{
    // Timed block of code goes here
}
```

At the completion of the using block, a message will be written to the log like:

```
[INF] Submitting payment for order-12345 completed in 456.7 ms
```

Operations that can either `succeed` or `fail`, or that produce a result, can be created with `Operation.Begin()`:

```cs
using (var op = Operation.Begin("Retrieving orders for {CustomerId}", customer.Id))
{
	// Timed block of code goes here

	op.Complete();
}
```

Using `op.Complete()` will produce the same kind of result as in the first example:

```
[INF] Retrieving orders for customer-67890 completed in 7.8 ms
```

If the operation is not completed by calling `Complete()`, it is assumed to have failed and a warning-level event will be written to the log instead:

```
[WRN] Retrieving orders for customer-67890 abandoned in 1234.5 ms
```

In this case the Outcome property will be "abandoned".
To suppress this message, for example when an operation turns out to be inapplicable, use `op.Cancel()`. Once `Cancel()` has been called, no event will be written by the operation on either `completion` or `abandonment`.

**Levelling**

Timings are most useful in production, so timing events are recorded at the Information level and higher, which should generally be collected all the time.

If you truly need `Verbose` - or `Debug`-level timings, you can trigger them with `Operation.At()` or the `OperationAt()` extension method on `ILogger`:

```cs
using (Operation.At(LogEventLevel.Debug).Time("Preparing zip archive"))
{
    // ...
}
```
When a level is specified, both completion and abandonment events will use it. To configure a different abandonment level, pass the second optional parameter to the `At()` method.

## Serilog & Kibana

`Kibana` is an open source data visualization user interface for ElasticSearch. Think of ElasticSearch as the database and Kibana as the web user interface which you can use to build graphs and query data in ElasticSearch.

**Installation**

1. Get Elasticsearch
2. Get Kibana
3. Start Elasticsearch: `bin/elasticsearch`
4. Start Kibana: `bin/kibana`
5. Open Kibana: `http://localhost:5601`
 
**ElasticSearch Sink**

Install below package

```bash
Install-Package Serilog.Sinks.ElasticSearch -Version 8.4.1
dotnet add package Serilog.Sinks.ElasticSearch --version 8.4.1
<PackageReference Include="Serilog.Sinks.ElasticSearch" Version="8.4.1" />
```

After installation, add the following code:

```cs
// Program.cs

using Serilog.Formatting.Elasticsearch;
using Serilog.Sinks.Elasticsearch;

public static void Main(string[] args)
{
    var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
    var config = BuildConfigurationRoot();
    Log.Logger = new LoggerConfiguration()
    
        // HERE     
        .WriteTo.Elasticsearch(ConfigureElasticSink(config, environment))
        
        .CreateLogger();
    try
    {
        Log.Information("Starting up");
        CreateHostBuilder(args).Build().Run();
    }
    catch (Exception ex)
    {
        Log.Fatal(ex, "Application start-up failed");
    }
    finally
    {
        Log.CloseAndFlush();
    }
}

// HERE
private static ElasticsearchSinkOptions ConfigureElasticSink(IConfigurationRoot configuration, string environment)
{
    return new ElasticsearchSinkOptions(new Uri(configuration["ElasticConfiguration:Uri"]))
    {
        AutoRegisterTemplate = true,
        AutoRegisterTemplateVersion = AutoRegisterTemplateVersion.ESv7,
        CustomFormatter = new ExceptionAsObjectJsonFormatter(renderMessage: true),
        // Our ElasticSearch index: ASSEMBLYNAME-ENVIROMENT-YEAR-MONTH 
        // This index must introduce to ElasticSearch/Kibana
        IndexFormat = $"{Assembly.GetExecutingAssembly().GetName().Name.ToLower().Replace(".", "-")}-{environment?.ToLower().Replace(".", "-")}-{DateTime.UtcNow:yyyy-MM}"
    };
}
```

And also in `appsettings.json`

```cs
"ElasticConfiguration": {
  "Uri": "http://localhost:9200"
},
```

**Define index to Kibana**

If this is your first run you will see `Create index pattern` page so go to step 3 but if you had any index before, start form beggining:

1. Run your application, Then browse the `Kibana` via `http://localhost:5601/app/home/`.
2. Find `Connect to your Elasticsearch index` link and click on it.
3. After that, Click on `Create index pattern` and introduce our index format like below
```txt
ASSEMBLYNAME-ENVIROMENT-* => myapp-development-*
```
4. Click on `Next step`
5. Choose `@timestamp`, then click on `Create index pattern`
6. Now, You can go to `Discover` page and find your logs!

## Reference(s)

Most of the information in this article has gathered from various references.

* https://nblumhardt.com/2019/10/serilog-in-aspnetcore-3/
* https://www.codewithmukesh.com/blog/serilog-in-aspnet-core-3-1/
* https://dejanstojanovic.net/aspnet/2018/october/extending-serilog-with-additional-values-to-log/
* https://github.com/nblumhardt/serilog-timings
* https://benfoster.io/blog/serilog-best-practices/
* https://esg.dev/posts/serilog-dos-and-donts/
* https://www.humankode.com/asp-net-core/logging-with-elasticsearch-kibana-asp-net-core-and-docker