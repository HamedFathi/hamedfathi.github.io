---
title: A Professional ASP.NET Core API - MiniProfiler 
date: September 30 2020
category: aspnetcore-api
tags:
    - dotnet
    - aspnetcore
    - webapi
    - profiler
    - miniprofiler
---
 
`MiniProfiler` is a library and UI for profiling your application. By letting you see where your time is spent, which queries are run, and any other custom timings you want to add, `MiniProfiler` helps you debug issues and optimize performance.

<!-- more -->

Install the below package

```bash
Install-Package MiniProfiler.AspNetCore.Mvc -Version 4.2.1
dotnet add package MiniProfiler.AspNetCore.Mvc --version 4.2.1
<PackageReference Include="MiniProfiler.AspNetCore.Mvc" Version="4.2.1" />
```

## ASP.NET Core

Edit your `Startup.cs` to add the middleware and configure options:


```cs
// Startup.ConfigureServices

public void ConfigureServices(IServiceCollection services)
{
    // The services.AddMemoryCache(); code is required
    // There is a bug in MiniProfiler, if we have not configured MemoryCache, it will fail.
    services.AddMemoryCache();
    // HERE
    services.AddMiniProfiler(options => options.RouteBasePath = "/profiler");

    services.AddControllers();
}
```

Once, you configure the `RouteBasePath` property, We are able access to
 
* `/profiler/results-index`: Get list of all requests.
* `/profiler/results`: Get the current request.
* `/profiler/results-list`: Get list of all requests as JSON.
 
Next we need add the `MiniProfiler` middleware, You can do like this.

```cs
// Startup.Configure

public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
{
    if (env.IsDevelopment())
    {
        app.UseDeveloperExceptionPage();
    }
    app.UseRouting();
    app.UseAuthorization();

    // HERE
    app.UseMiniProfiler();

    app.UseEndpoints(endpoints =>
    {
        endpoints.MapControllers();
    });
}
```

## Custom profiling

If you want to your own code profiling you can use the `MiniProfiler.Current` object, like this.

```cs
public IActionResult Put([FromRoute]int id, [FromBody]WeatherForecast weatherForecast)
{
    // HERE
    using (MiniProfiler.Current.Step("PUT method for WeatherForecast controller"))
    {
        WeatherForecast weatherForecastById = null;
        using (MiniProfiler.Current.Step("Getting Weather Forecase for the Id"))
        {
            weatherForecastById = GetWeatherForecast(id);
        }

        if (weatherForecastById == null)
        {
            return NotFound();
        }

        if (weatherForecastById.Id != id)
        {
            return BadRequest();
        }
        using (MiniProfiler.Current.Step("Updating the Data"))
        {
            _databaseContext.Entry(weatherForecast).State = EntityState.Modified;
            _databaseContext.SaveChanges();
        }
        return NoContent();
    }
}
```

## Entity Framework Core

Hooking up profiling to Entity Framework Core is easy to do:

Install the below package

```bash
Install-Package MiniProfiler.EntityFrameworkCore -Version 4.2.1
dotnet add package MiniProfiler.EntityFrameworkCore --version 4.2.1
<PackageReference Include="MiniProfiler.EntityFrameworkCore" Version="4.2.1" />
```

And, In your `Startup.cs`, call `AddEntityFramework()`:

```cs
// Startup.ConfigureServices

public void ConfigureServices(IServiceCollection services)
{
    services.AddMemoryCache();
    services.AddMiniProfiler(options => options.RouteBasePath = "/profiler")
            .AddEntityFramework(); // HERE

    services.AddEntityFrameworkSqlite().AddDbContext<DatabaseContext>();
    services.AddControllers();
}

```

## Reference(s)

Most of the information in this article has gathered from various references.

* https://dotnetthoughts.net/using-miniprofiler-in-aspnetcore-webapi/
* https://miniprofiler.com/dotnet/AspDotNetCore