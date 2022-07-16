---
title: A Professional ASP.NET Core API - CORS
date: September 20 2020
category: aspnetcore-api
tags:
    - dotnet
    - aspnetcore
    - webapi
    - cors
---

Browser security prevents a web page from making requests to a different domain than the one that served the web page. This restriction is called the `same-origin policy`. The same-origin policy prevents a malicious site from reading sensitive data from another site. Sometimes, you might want to allow other sites to make cross-origin requests to your app.

<!-- more -->

## What is the meaning of Same origin?

Two URLs have the same origin if they have identical schemes, hosts, and ports.

These two URLs have the same origin:

* `https://example.com/foo.html`
* `https://example.com/bar.html`

These URLs have different origins than the previous two URLs:

* `https://example.net`: Different domain
* `https://www.example.com/foo.html`: Different subdomain
* `http://example.com/foo.html`: Different scheme
* `https://example.com:9000/foo.html`: Different port

## How to enable CORS?

There are three ways to enable CORS:

1. In middleware using a `named policy` or `default policy`.
2. Using `endpoint routing`.
3. With the `[EnableCors]` attribute.

**Warning:** `UseCors` must be called before `UseResponseCaching`.

## CORS with named policy and middleware

```cs
public class Startup
{
    readonly string MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

    public void ConfigureServices(IServiceCollection services)
    {
        services.AddCors(options =>
        {
            options.AddPolicy(name: MyAllowSpecificOrigins,
                    builder =>
                    {
                        builder.WithOrigins("http://example.com",
                                        "http://www.contoso.com")
                                        .AllowAnyHeader()
                                        .AllowAnyMethod();
                    });
        });

        // services.AddResponseCaching();
        services.AddControllers();
    }

    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        if (env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
        }

        app.UseHttpsRedirection();
        app.UseStaticFiles();
        app.UseRouting();

        app.UseCors(MyAllowSpecificOrigins);

        // app.UseResponseCaching();

        app.UseAuthorization();

        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllers();
        });
    }
}
```

## CORS with default policy and middleware

```cs
public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddCors(options =>
        {
            options.AddDefaultPolicy(
                builder =>
                {
                    // Be careful dont use '/' at the end of the url.
                    // eg. 'http://example.com/' does not work correctly.
                    builder.WithOrigins("http://example.com",
                                        "http://www.contoso.com"); 
                                        
                    builder.WithOrigins("http://localhost:4200")
                            .AllowAnyMethod()
                            .AllowAnyHeader(); 
                });
        });

        services.AddControllers();
    }

    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        if (env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
        }

        app.UseHttpsRedirection();
        app.UseStaticFiles();
        app.UseRouting();

        app.UseCors();

        app.UseAuthorization();

        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllers();
        });
    }
}
```

## Enable CORS with endpoint routing

```cs
public class Startup
{
    readonly string MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

    public void ConfigureServices(IServiceCollection services)
    {
        services.AddCors(options =>
        {
            options.AddPolicy(name: MyAllowSpecificOrigins,
                    builder =>
                    {
                        builder.WithOrigins("http://example.com",
                                            "http://www.contoso.com");
                    });
        });

        services.AddControllers();
        services.AddRazorPages();
    }

    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        if (env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
        }

        app.UseHttpsRedirection();
        app.UseStaticFiles();
        app.UseRouting();

        app.UseCors();

        app.UseAuthorization();

        app.UseEndpoints(endpoints =>
        {
            endpoints.MapGet("/echo",
                context => context.Response.WriteAsync("echo"))
                .RequireCors(MyAllowSpecificOrigins);

            endpoints.MapControllers()
                     .RequireCors(MyAllowSpecificOrigins);

            endpoints.MapGet("/echo2",
                context => context.Response.WriteAsync("echo2"));

            endpoints.MapRazorPages();
        });
    }
}
```

## Enable CORS with attributes

Enabling CORS with the `[EnableCors]` attribute and applying a named policy to only those endpoints that require CORS provides the finest control.

The `[EnableCors]` attribute provides an alternative to applying CORS globally. The `[EnableCors]` attribute enables CORS for selected endpoints, rather than all endpoints:

* `[EnableCors]` specifies the default policy.
* `[EnableCors("{Policy String}")]` specifies a named policy.

The [EnableCors] attribute can be applied to:

* Razor Page PageModel
* Controller
* Controller action method

Different policies can be applied to controllers, page models, or action methods with the `[EnableCors]` attribute. When the `[EnableCors]` attribute is applied to a controller, page model, or action method, and CORS is enabled in middleware, both policies are applied. **We recommend against combining policies. Use the [EnableCors] attribute or middleware, not both in the same app.**

A different policy to each method:

```cs
[Route("api/[controller]")]
[ApiController]
public class WidgetController : ControllerBase
{
    // GET api/values
    [EnableCors("AnotherPolicy")]
    [HttpGet]
    public ActionResult<IEnumerable<string>> Get()
    {
        return new string[] { "green widget", "red widget" };
    }

    // GET api/values/5
    [EnableCors("Policy1")]
    [HttpGet("{id}")]
    public ActionResult<string> Get(int id)
    {
        return id switch
        {
            1 => "green widget",
            2 => "red widget",
            _ => NotFound(),
        };
    }
}
```

Creates two CORS policies:

```cs
public class Startup
{
    public Startup(IConfiguration configuration)
    {
        Configuration = configuration;
    }

    public IConfiguration Configuration { get; }

    public void ConfigureServices(IServiceCollection services)
    {
        services.AddCors(options =>
        {
            options.AddPolicy("Policy1",
                builder =>
                {
                    builder.WithOrigins("http://example.com",
                                        "http://www.contoso.com");
                });

            options.AddPolicy("AnotherPolicy",
                builder =>
                {
                    builder.WithOrigins("http://www.contoso.com")
                                        .AllowAnyHeader()
                                        .AllowAnyMethod();
                });
        });

        services.AddControllers();
    }

    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        if (env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
        }

        app.UseHttpsRedirection();

        app.UseRouting();

        app.UseCors();

        app.UseAuthorization();

        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllers();
        });
    }
}
```

For the finest control of limiting CORS requests:

* Use `[EnableCors("MyPolicy")]` with a named policy.
* Don't define a default policy.
* Don't use endpoint routing.

## Disable CORS

The `[DisableCors]` attribute does not disable CORS that has been enabled by endpoint routing.

The following code defines the CORS policy "MyPolicy":

```cs
public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddCors(options =>
        {
            options.AddPolicy(name: "MyPolicy",
                builder =>
                {
                    builder.WithOrigins("http://example.com",
                                        "http://www.contoso.com")
                            .WithMethods("PUT", "DELETE", "GET");
                    builder.WithOrigins("http://localhost:4200")
                            .AllowAnyMethod()
                            .AllowAnyHeader();                            
                });
        });

        services.AddControllers();
        services.AddRazorPages();
    }

    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        if (env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
        }

        app.UseHttpsRedirection();
        app.UseStaticFiles();
        app.UseRouting();

        app.UseCors();

        app.UseAuthorization();

        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllers();
            endpoints.MapRazorPages();
        });
    }
}
```

The following code disables CORS for the `GetValues2` action:

```cs
[EnableCors("MyPolicy")]
[Route("api/[controller]")]
[ApiController]
public class ValuesController : ControllerBase
{
    // GET api/values
    [HttpGet]
    public IActionResult Get() =>
        ControllerContext.MyDisplayRouteInfo();

    // GET api/values/5
    [HttpGet("{id}")]
    public IActionResult Get(int id) =>
        ControllerContext.MyDisplayRouteInfo(id);

    // PUT api/values/5
    [HttpPut("{id}")]
    public IActionResult Put(int id) =>
        ControllerContext.MyDisplayRouteInfo(id);


    // GET: api/values/GetValues2
    [DisableCors]
    [HttpGet("{action}")]
    public IActionResult GetValues2() =>
        ControllerContext.MyDisplayRouteInfo();

}
```

## CORS policy options

* `AllowAnyOrigin`: Allows CORS requests from all origins with any scheme (http or https). AllowAnyOrigin is insecure because any website can make cross-origin requests to the app.
* `AllowAnyMethod`: Allows any HTTP method.
* `AllowAnyHeader`: Ensures that the policy allows any header.
* `AllowCredentials`: The server must allow the credentials.

```cs
public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddCors(options =>
        {
            options.AddPolicy(name: MyAllowSpecificOrigins,
                    builder =>
                    {
                        // Allow Anything
                        builder
                           .AllowAnyOrigin()
                           .AllowAnyMethod()
                           .AllowAnyHeader()
                           .AllowCredentials()
                           ;
                    });
        });

        // services.AddResponseCaching();
        services.AddControllers();
    }
    
    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        if (env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
        }

        app.UseHttpsRedirection();
        app.UseStaticFiles();
        app.UseRouting();

        // HERE
        app.UseCors(MyAllowSpecificOrigins);

        // app.UseResponseCaching();

        app.UseAuthorization();

        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllers();
        });
    }
}
```

## Reference(s)

Most of the information in this article has gathered from various references.

* https://docs.microsoft.com/en-us/aspnet/core/security/cors