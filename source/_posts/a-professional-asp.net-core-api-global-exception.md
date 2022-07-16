---
title: A Professional ASP.NET Core API - Global Exception Handling
date: September 18 2020
category: aspnetcore-api
tags:
    - dotnet
    - aspnetcore
    - webapi
    - exception
    - middleware
---


ASP.NET Core gives provides the ability to write middleware, which is logic inserted into the pipeline that the framework runs for every request that is received by the application. ASP.NET Core ships with core middleware components that enable things like rendering MVC pages, defining endpoint routes, and adding authentication support, and these things are configured in the application’s Startup class, where you can also add your own custom middleware components. This ability to easily configure and customize how ASP.NET Core processes requests is tremendously useful and powerful.

We will be creating exception-handling middleware to catch and handle any exceptions that are thrown during the execution of a request to our service. 

<!-- more -->

So, Create a model for your error details as below

```cs
public class ExceptionResult
{
    public ExceptionResult(string exception, int statusCode, string requestId)
    {
        Exception = exception;
        StatusCode = statusCode;
        RequestId = requestId;
    }
    public string Exception { get; set; }
    public string RequestId { get; set; }
    public int StatusCode { get; set; }
}
```

Create the Global Exception middleware which will handle exceptions globally in your API

```cs
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;
    private readonly IWebHostEnvironment _env;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger, IWebHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }
    public async Task Invoke(HttpContext context)
    {
        string message = null;
        HttpStatusCode httpStatusCode = HttpStatusCode.InternalServerError;
        var requestId = Activity.Current?.Id ?? context.TraceIdentifier;
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError($"An unhandled exception has occurred while executing the request. {ex}");

            // ASPNETCORE_ENVIRONMENT = Development
            if (_env.IsDevelopment())
            {
                var dic = new Dictionary<string, string>
                {
                    ["StackTrace"] = ex.StackTrace,
                    ["Message"] = ex.Message
                };
                message = JsonSerializer.Serialize(dic);
            }
            else
            {
                message = "An internal server error has occurred.";
            }
            await WriteToReponseAsync();
        }
        async Task WriteToReponseAsync()
        {
            if (context.Response.HasStarted)
                throw new InvalidOperationException("The response has already started");
            var exceptionResult = new ExceptionResult(message, (int)httpStatusCode, requestId);
            var result = JsonSerializer.Serialize(exceptionResult);
            context.Response.StatusCode = (int)httpStatusCode;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync(result);
        }
    }
}
```

You may notice that the other middleware components all have custom extension methods to make adding them easy. Let’s add an extension method for our custom middleware too.

```cs
using Microsoft.AspNetCore.Builder;

public static class ExceptionHandlerMiddlewareExtension
{
    public static void UseGlobalException(this IApplicationBuilder app)
    {
        app.UseMiddleware<GlobalExceptionMiddleware>();
    }
}
```

Register GlobalException middleware in your API. It should be before other middlewares to catch exceptions correctly.


```cs
public void Configure(IApplicationBuilder app)
{
    app.UseGlobalException(); // HERE
    
    app.UseHttpsRedirection();
    app.UseRouting();
    app.UseAuthorization();
    app.UseEndpoints(endpoints =>
    {
        endpoints.MapControllers();
    });
}
```

## Reference(s)

Most of the information in this article has gathered from various references.

* https://blog.jonblankenship.com/2020/04/12/global-exception-handling-in-aspnet-core-api/
* https://dotnetdocs.ir/Post/28/%D9%85%D8%AF%DB%8C%D8%B1%DB%8C%D8%AA-%D8%AE%D8%B7%D8%A7%D9%87%D8%A7-(-exception-handling-)-%D8%AF%D8%B1-asp.net-core-3.1