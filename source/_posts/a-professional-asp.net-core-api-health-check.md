---
title: A Professional ASP.NET Core API - HealthCheck
date: October 5 2020
category: aspnetcore-api
tags:
    - dotnet
    - aspnetcore
    - webapi
    - healthy
    - unhealthy
    - health
    - healthcheck
---
 
ASP.NET Core offers Health Checks Middleware and libraries for reporting the health of app infrastructure components.

Health checks are exposed by an app as HTTP endpoints. Health check endpoints can be configured for a variety of real-time monitoring scenarios:

* Health probes can be used by container orchestrators and load balancers to check an app's status. For example, a container orchestrator may respond to a failing health check by halting a rolling deployment or restarting a container. A load balancer might react to an unhealthy app by routing traffic away from the failing instance to a healthy instance.
* Use of memory, disk, and other physical server resources can be monitored for healthy status.
* Health checks can test an app's dependencies, such as databases and external service endpoints, to confirm availability and normal functioning.

<!-- more -->

Install the below package

```bash
Install-Package Microsoft.AspNetCore.Diagnostics.HealthChecks -Version 2.2.0
dotnet add package Microsoft.AspNetCore.Diagnostics.HealthChecks --version 2.2.0
<PackageReference Include="Microsoft.AspNetCore.Diagnostics.HealthChecks" Version="2.2.0" />
```

To start working with HealthCheck system you should add configs as following

```cs
// Startup.cs

public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddControllers();
        
        // HERE
        services.AddHealthChecks();
    }

    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        if (env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
        }

        app.UseRouting();
        app.UseAuthorization();
        
        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllers();
            
            // HERE
            endpoints.MapHealthChecks("/health");
        });
    }
}
```

Now, You are able to browse `http://localhost:PORT/health` to see `Healthy`!

## Create health checks

Health checks are created by implementing the `IHealthCheck` interface. The `CheckHealthAsync` method returns a `HealthCheckResult` that indicates the health as `Healthy`, `Degraded`, or `Unhealthy`. The result is written as a plaintext response with a configurable status code. `HealthCheckResult` can also return optional key-value pairs.

The following `ExampleHealthCheck` class demonstrates the layout of a health check. The health checks logic is placed in the `CheckHealthAsync` method. The following example sets a dummy variable, healthCheckResultHealthy, to `true`. If the value of healthCheckResultHealthy is set to `false`, the `HealthCheckResult.Unhealthy` status is returned.

```cs
// ExampleHealthCheck.cs

using System.Threading;
using Microsoft.Extensions.Diagnostics.HealthChecks;

public class ExampleHealthCheck : IHealthCheck
{
    public Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        var healthCheckResultHealthy = true;

        if (healthCheckResultHealthy)
        {
            return Task.FromResult(
                HealthCheckResult.Healthy("A healthy result."));
        }

        return Task.FromResult(
            HealthCheckResult.Unhealthy("An unhealthy result."));
    }
}
```

## Register health check services

The `ExampleHealthCheck` type is added to health check services with AddCheck in `Startup.ConfigureServices`:

```cs
// Startup.ConfigureServices.cs

public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddControllers();
        
        // HERE
        services.AddHealthChecks()
            .AddCheck<ExampleHealthCheck>("example_health_check") /* HERE */
        ;
    }
}
```

**Tags** 

They can be used to filter health checks.

```cs
// Startup.ConfigureServices.cs

public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddControllers();
        
        services.AddHealthChecks()
            .AddCheck<ExampleHealthCheck>(
                "example_health_check",
                failureStatus: HealthStatus.Degraded,
                tags: new[] { "example" });
    }
}
```

`AddCheck` can also execute a lambda function. In the following example, the health check name is specified as `Example` and the check always returns a `healthy` state:

```cs
// Startup.ConfigureServices.cs

public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddControllers();
        
        services.AddHealthChecks()
            .AddCheck("Example", () =>
                HealthCheckResult.Healthy("Example is OK!"), tags: new[] { "example" });
    }
}
```

**Health check with arguments**

Call `AddTypeActivatedCheck` to pass arguments to a health check implementation. In the following example, `TestHealthCheckWithArgs` accepts an integer and a string for use when `CheckHealthAsync` is called:

```cs
public class TestHealthCheckWithArgs : IHealthCheck
{
    public TestHealthCheckWithArgs(int i, string s)
    {
        I = i;
        S = s;
    }

    public int I { get; set; }

    public string S { get; set; }

    public Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, 
        CancellationToken cancellationToken = default)
    {
        ...
    }
}
```

`TestHealthCheckWithArgs` is registered by calling `AddTypeActivatedCheck` with the integer and string passed to the implementation:

```cs
services.AddHealthChecks()
    .AddTypeActivatedCheck<TestHealthCheckWithArgs>(
        "test", 
        failureStatus: HealthStatus.Degraded, 
        tags: new[] { "example" }, 
        args: new object[] { 5, "string" });
```

**HealthStatus**

Represents the reported status of a health check result.

| Status | Description |
|--------|-------------|
|Degraded|It could be used for checks that did succeed but are slow or unstable. For example, A simple database query did succeed but took more than a second. Moving traffic to another instance is probably a good idea until the problem has resolved.|
|Healthy|Indicates that the health check determined that the component was healthy.|
|Unhealthy|It means that the component does not work at all. For example, A connection to the Redis cache could no be established. Restarting the instance could solve this issue.|

## Health Checks Routing

In `Startup.Configure`, call MapHealthChecks on the endpoint builder with the endpoint URL or relative path:

```cs
app.UseEndpoints(endpoints =>
{
    endpoints.MapHealthChecks("/health");
});
```

**Require host**

Call `RequireHost` to specify one or more permitted hosts for the health check endpoint. Hosts should be Unicode rather than punycode and may include a port. If a collection isn't supplied, any host is accepted.

```cs
app.UseEndpoints(endpoints =>
{
    endpoints.MapHealthChecks("/health").RequireHost("www.contoso.com:5001");
});
```

**Require authorization**

Call `RequireAuthorization` to run Authorization Middleware on the health check request endpoint. A `RequireAuthorization` overload accepts one or more authorization policies. If a policy isn't provided, the default authorization policy is used.

```cs
app.UseEndpoints(endpoints =>
{
    endpoints.MapHealthChecks("/health").RequireAuthorization();
});
```

## Filter health checks

By default, Health Checks Middleware runs all registered health checks. To run a subset of health checks, provide a function that returns a boolean to the `Predicate` option. In the following example, the `Bar` health check is filtered out by its tag (`bar_tag`) in the function's conditional statement, where true is only returned if the health check's Tags property matches `foo_tag` or `baz_tag`:

```cs
services.AddHealthChecks()
    .AddCheck("Foo", () =>
        HealthCheckResult.Healthy("Foo is OK!"), tags: new[] { "foo_tag" })
    .AddCheck("Bar", () =>
        HealthCheckResult.Unhealthy("Bar is unhealthy!"), tags: new[] { "bar_tag" })
    .AddCheck("Baz", () =>
        HealthCheckResult.Healthy("Baz is OK!"), tags: new[] { "baz_tag" });
```

In `Startup.Configure`, the `Predicate` filters out the 'Bar' health check. Only Foo and Baz execute.:

```cs
app.UseEndpoints(endpoints =>
{
    endpoints.MapHealthChecks("/health", new HealthCheckOptions()
    {
        // HERE
        Predicate = (check) => check.Tags.Contains("foo_tag") ||
            check.Tags.Contains("baz_tag")
    });
});
```

## Suppress cache headers


`AllowCachingResponses` controls whether the Health Checks Middleware adds HTTP headers to a probe response to prevent response caching. If the value is `false` (default), the middleware sets or overrides the `Cache-Control`, `Expires`, and `Pragma` headers to prevent response caching. If the value is true, the middleware doesn't modify the cache headers of the response.

```cs
app.UseEndpoints(endpoints =>
{
    endpoints.MapHealthChecks("/health", new HealthCheckOptions()
    {
        AllowCachingResponses = false
    });
});
```

## Customize output

In order to generate a more readable response that makes sense, let's add a bunch of reponse classes.

* Response Class for Overall Health
* Response Class for Component-wise Health

```cs
// HealthCheckResponse.cs
public class HealthCheckResponse
{
    public string Status { get; set; }
    public string Component { get; set; }
    public string Description { get; set; }
    public IEnumerable<string> Tags { get; set; }
    public string Exception { get; set; }
}

// HealthCheckResult.cs
// The aggregation of all health check responses, even if one is unhealthy, 'Status' will be unhealthy.
public class HealthCheckResult
{
    public string Status { get; set; }
    public IEnumerable<HealthCheckResponse> HealthChecks { get; set; }
    public string HealthCheckDuration { get; set; }
}
```

`ResponseWriter` is responsible for how the response is displayed.

```cs
// Startup.Configure

using System.Text.Json;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Http;
using System.Linq;

public class Startup
{
    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        if (env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
        }

        app.UseRouting();
        app.UseAuthorization();
        
        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllers();
            
            // HERE
            endpoints.MapHealthChecks("/health", new HealthCheckOptions
            {
                ResponseWriter = async (context, report) =>
                {
                    context.Response.ContentType = "application/json";
                    var response = new HealthCheckResult
                    {
                        Status = report.Status.ToString(),
                        HealthChecks = report.Entries.Select(x => new HealthCheckResponse
                        {
                            Component = x.Key,
                            Status = x.Value.Status.ToString(),
                            Description = x.Value.Description,
                            Exception = x.Value.Exception?.Message,
                            Tags = x.Value.Tags
                        }),
                        HealthCheckDuration = report.TotalDuration.ToString()
                    };
                    await context.Response.WriteAsync(JsonSerializer.Serialize(response));
                }
            });
        });
    }
}
```

Based on above sample the result will be:

```json
{
   "Status":"Healthy",
   "HealthChecks":[
      {
         "Status":"Healthy",
         "Component":"example_health_check",
         "Description":"A healthy result.",
         "Tags":[
            "example"
         ],
         "Exception":null
      }
   ],
   "HealthCheckDuration":"00:00:00.0010732"
}
```

## Enterprise solution

[AspNetCore.Diagnostics.HealthChecks](https://github.com/Xabaril/AspNetCore.Diagnostics.HealthChecks) is an enterprise HealthChecks for ASP.NET Core Diagnostics Package.

There are a lot of HealthChecks packages that you can find in above link.

**URIs**

Install the below package

```bash
Install-Package AspNetCore.HealthChecks.Uris -Version 3.1.2
dotnet add package AspNetCore.HealthChecks.Uris --version 3.1.2
<PackageReference Include="AspNetCore.HealthChecks.Uris" Version="3.1.2" />
```

Register you site's URL via `AddUrlGroup`

```cs
// Startup.ConfigureServices

using System;

public void ConfigureServices(IServiceCollection services)
{
    services.AddControllers();
    services.AddHealthChecks()
            // HERE
            .AddUrlGroup(new Uri("https://hamedfathi.me"), 
                name: "Hamed Fathi's Blog", 
                tags: new[] { "blog", "tutorial" }
            );
}
```

**System**

Install the below package

```bash
Install-Package AspNetCore.HealthChecks.System -Version 3.1.2
dotnet add package AspNetCore.HealthChecks.System --version 3.1.2
<PackageReference Include="AspNetCore.HealthChecks.System" Version="3.1.2" />
```

Register it inside `ConfigureServices`

```cs
// Startup.ConfigureServices

using System;

public void ConfigureServices(IServiceCollection services)
{
    services.AddControllers();
    services.AddHealthChecks()
            // HERE
            .AddDiskStorageHealthCheck(s => s.AddDrive("C:\\", 1024)) // 1024 MB (1 GB) free minimum
            .AddProcessAllocatedMemoryHealthCheck(512) // 512 MB max allocated memory
            .AddProcessHealthCheck("svchost", p => p.Length > 0) // The process is available
}
```

**HealthChecks UI**

The project `HealthChecks.UI` is a minimal UI interface that stores and shows the health checks results from the configured HealthChecks URIs, So:

Install the below packages

```bash
Install-Package AspNetCore.HealthChecks.UI -Version 3.1.3
dotnet add package AspNetCore.HealthChecks.UI --version 3.1.3
<PackageReference Include="AspNetCore.HealthChecks.UI" Version="3.1.3" />

Install-Package AspNetCore.HealthChecks.UI.Client -Version 3.1.2
dotnet add package AspNetCore.HealthChecks.UI.Client --version 3.1.2
<PackageReference Include="AspNetCore.HealthChecks.UI.Client" Version="3.1.2" />

Install-Package AspNetCore.HealthChecks.UI.InMemory.Storage -Version 3.1.2
dotnet add package AspNetCore.HealthChecks.UI.InMemory.Storage --version 3.1.2
<PackageReference Include="AspNetCore.HealthChecks.UI.InMemory.Storage" Version="3.1.2" />
```

To config the `HealthChecks.UI` you should do as following:

```cs
public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddControllers();
        
        // HERE
        services.AddHealthChecks();
        services.AddHealthChecksUI(options =>
                 {
                     options.AddHealthCheckEndpoint("endpoint1", "http://localhost:5000/health");
                 })
                .AddInMemoryStorage();
    }

    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        if (env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
        }

        app.UseRouting();

        app.UseAuthorization();

        // HERE
        app.UseHealthChecksUI();

        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllers();
            
            // HERE
            endpoints.MapHealthChecks("/health", new HealthCheckOptions()
            {
                Predicate = _ => true,
                ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
            });
        });
    }
}
```

Now, Browse your UI via `http://localhost:PORT/healthchecks-ui`.

The important part of configuration is `AddHealthCheckEndpoint`.

## HealthChecks UI Settings

Here are some important settings:

**UI Polling interval**

You can configure the polling interval in seconds for the UI inside the setup method. Default value is `10` seconds:

```cs
// Startup.ConfigureServices

public void ConfigureServices(IServiceCollection services)
{
    services.AddControllers();
    
    services.AddHealthChecks();
    services.AddHealthChecksUI(options =>
             {
                 options.AddHealthCheckEndpoint("endpoint1", "http://localhost:5000/health");
                 
                 // Configures the UI to poll for healthchecks updates every 5 seconds
                 options.SetEvaluationTimeInSeconds(5); 
             })
            .AddInMemoryStorage();
}
```

**UI API max active requests**

You can configure max active requests to the HealthChecks UI backend api using the setup method. Default value is `3` active requests:

```cs
// Startup.ConfigureServices

public void ConfigureServices(IServiceCollection services)
{
    services.AddControllers();
    
    services.AddHealthChecks();
    services.AddHealthChecksUI(options =>
             {
                 options.AddHealthCheckEndpoint("endpoint1", "http://localhost:5000/health");
                 options.SetEvaluationTimeInSeconds(5); 
                 
                 // Only one active request will be executed at a time. 
                 // All the excedent requests will result in 429 (Too many requests)
                 options.SetApiMaxActiveRequests(1); 
             })
            .AddInMemoryStorage();
}
```

## HealthChecks UI JSON Settings

It is possible for you to customize your settings in `appsettings.json`:

```json
"HealthChecksUI": {
     "HealthChecks": [
          {
              "Name": "endpoint1",
              "Uri": "http://localhost:5000/health"
          }
     ],
     "EvaluationTimeOnSeconds": 10,
     "MinimumSecondsBetweenFailureNotifications": 60
}
```


## Reference(s)

Most of the information in this article has gathered from various references.

* https://docs.microsoft.com/en-us/aspnet/core/host-and-deploy/health-checks
* https://www.codewithmukesh.com/blog/healthchecks-in-aspnet-core-explained/
* https://blog.zhaytam.com/2020/04/30/health-checks-aspnetcore/
* https://volosoft.com/blog/Using-Health-Checks-in-ASP.NET-Boilerplate
* https://github.com/Xabaril/AspNetCore.Diagnostics.HealthChecks