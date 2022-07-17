---
title: A Professional ASP.NET Core API - DryIoc
date: September 22 2020
category: aspnetcore-api
tags:
    - dotnet
    - aspnetcore
    - webapi
    - di
    - ioc
    - dryioc
---
 
DryIoc is fast, small, full-featured IoC Container for .NET. Designed for low-ceremony use, performance, and extensibility.

In the following we will see how it can be added to a project.

<!-- more -->

Install the below packages

```bash
Install-Package DryIoc.dll -Version 4.4.1
dotnet add package DryIoc.dll --version 4.4.1
<PackageReference Include="DryIoc.dll" Version="4.4.1" />

Install-Package DryIoc.Microsoft.DependencyInjection -Version 4.1.0
dotnet add package DryIoc.Microsoft.DependencyInjection --version 4.1.0
<PackageReference Include="DryIoc.Microsoft.DependencyInjection" Version="4.1.0" />
```

To Plug-in the `DryIoc` you should introduce it inside the host builder.

```cs
// Startup.CreateHostBuilder
public class Program
{
    public static async Task Main(string[] args) => 
        await CreateHostBuilder(args).Build().RunAsync();

    public static IHostBuilder CreateHostBuilder(string[] args) =>
        Host.CreateDefaultBuilder(args)
            .ConfigureLogging((hostingContext, logging) =>
            {
                logging.ClearProviders(); // removes all providers from LoggerFactory
                logging.AddConfiguration(hostingContext.Configuration.GetSection("Logging"));
                logging.AddDebug();
            })

            // HERE
            .UseServiceProviderFactory(new DryIocServiceProviderFactory())

            .ConfigureWebHostDefaults(webBuilder =>
            {
                webBuilder.UseStartup<Startup>();
            });
}
```

To simplify the above process you can write a custom extension method. 

```cs
public static class DryIocExtensions
{
    public static IHostBuilder UseDryIoc(this IHostBuilder hostBuilder, IServiceProviderFactory<IContainer> factory = null)
    {
        return hostBuilder.UseServiceProviderFactory(factory ?? new DryIocServiceProviderFactory());
    }
}
```

And use it as following

```cs
// Startup.CreateHostBuilder
public class Program
{
    public static async Task Main(string[] args) => 
        await CreateHostBuilder(args).Build().RunAsync();

    public static IHostBuilder CreateHostBuilder(string[] args) =>
        Host.CreateDefaultBuilder(args)
            .ConfigureLogging((hostingContext, logging) =>
            {
                logging.ClearProviders(); // removes all providers from LoggerFactory
                logging.AddConfiguration(hostingContext.Configuration.GetSection("Logging"));
                logging.AddDebug();
            })

            // HERE
            .UseDryIoc()

            .ConfigureWebHostDefaults(webBuilder =>
            {
                webBuilder.UseStartup<Startup>();
            });
}
```

## How to enable pre-configured settings?

If you want to set some pre-configred settings just follow the steps:

**Implementation**

First, define a method with your custom setting.

```cs
// Startup.cs

/// <summary>
/// Use this method to pass your custom pre-configured container to the `IHostBuilderUseServiceProviderFactory` in "Program.cs"
/// </summary>
public static IContainer CreateMyPreConfiguredContainer() =>
    // This is an example configuration,
    // for possible options check the https://github.com/dadhi/DryIoc/blob/master/docs/DryIoc.Docs/RulesAndDefaultConventions.md
    new Container(rules =>
        // Configures property injection for Controllers, ensure that you've added `AddControllersAsServices` in `ConfigureServices`
        rules.With(propertiesAndFields: request => 
            request.ServiceType.Name.EndsWith("Controller") ? PropertiesAndFields.Properties()(request) : null)
    );
```

**Registration**

Then, register it like the below 

```cs
// Startup.CreateHostBuilder
public class Program
{
    public static async Task Main(string[] args) => 
        await CreateHostBuilder(args).Build().RunAsync();

    public static IHostBuilder CreateHostBuilder(string[] args) =>
        Host.CreateDefaultBuilder(args)

            // Plug-in the DryIoc
            // CreateMyPreConfiguredContainer method is the key.
            .UseServiceProviderFactory(new DryIocServiceProviderFactory(Startup.CreateMyPreConfiguredContainer()))

            // Or
            // .UseDryIoc(Startup.CreateMyPreConfiguredContainer())

            .ConfigureWebHostDefaults(webBuilder =>
            {
                webBuilder.UseStartup<Startup>();
            });
}
```

## How to set it up?

To activate all the features, write the following codes in the `Startup` class.

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
        var mvcBuilder = services.AddControllers();
        
        // uses DI to construct the controllers - required for the DryIoc diagnostics, property injection, etc. to work;
        mvcBuilder.AddControllersAsServices();
    }
    /// <summary>
    /// Use this method to pass your custom pre-configured container to the `IHostBuilder.UseServiceProviderFactory` in "Program.cs"
    /// </summary>
    public static IContainer CreateMyPreConfiguredContainer() =>
        // This is an example configuration,
        // for possible options check the https://github.com/dadhi/DryIoc/blob/master/docs/DryIoc.Docs/RulesAndDefaultConventions.md
        new Container(rules =>
            // Configures property injection for Controllers, ensure that you've added `AddControllersAsServices` in `ConfigureServices`
            rules.With(propertiesAndFields: request => 
                request.ServiceType.Name.EndsWith("Controller") ? PropertiesAndFields.Properties()(request) : null)
        );

    // The most important conventional method to enable third-party IoCs.    
    public void ConfigureContainer(IContainer container)
    {
        // You may place your registrations here or split them in different classes, or organize them in some kind of modules, e.g:
        BasicServicesRegistrator.Register(container);
        SpecialServicesRegistrator.Register(container);
        // NOTE:
        // Don't configure the container rules here because DryIoc uses the immutable container/configuration
        // and you customized container will be lost.
        // Instead you may use something like `CreateMyPreConfiguredContainer` above.
    }

    // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
    public void Configure(IApplicationBuilder app, IWebHostEnvironment env, ILoggerFactory loggerFactory)
    {
        var logger = loggerFactory.CreateLogger<Startup>();

        // All DryIoc Container interfaces are available through the MS.DI services
        var container = app.ApplicationServices.GetRequiredService<IContainer>();
        logger.LogInformation($"You may use the DryIoc container here: '{container}'");

        if (env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
        }
        app.UseHttpsRedirection();
        app.UseRouting();
        app.UseAuthorization();
        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllers();
        });
    }
}
```

As you can see above you can put your registration information in different classes.

```cs
BasicServicesRegistrator.Register(container);
SpecialServicesRegistrator.Register(container);
```

And that's exactly the way they are shaped:

```cs
// BasicServicesRegistrator.cs
public static class BasicServicesRegistrator
{
    public static void Register(IRegistrator r)
    {
        r.Register<ISingletonService, SingletonService>(Reuse.Singleton);
        r.Register<ITransientService, TransientService>(Reuse.Transient);
        r.Register<IScopedService, ScopedService>(Reuse.InCurrentScope);
    }
}

// SpecialServicesRegistrator.cs
public static class SpecialServicesRegistrator
{
    public static void Register(IRegistrator r)
    {
        // r.Register<IExportedService, ExportedService>();
        // Optionally using the MEF Exported services
        r.RegisterExports(typeof(ExportedService));
    }
}
```

## Reference(s)

Most of the information in this article has gathered from various references.

* https://github.com/dadhi/DryIoc