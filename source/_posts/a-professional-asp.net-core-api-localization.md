---
title: A Professional ASP.NET Core API - Localization
date: September 27 2020
category: aspnetcore-api
tags:
    - dotnet
    - aspnetcore
    - webapi
    - localization
---

Globalization and localization are two important concepts that you should be aware of to internationalize your applications. In essence, globalization and localization are concepts that help you reach a wider audience. The former relates to building applications that support various cultures and the latter relates to how you can build your application that can support a particular locale and culture. In other words, an application takes advantage of globalization to be able to cater to different languages based on user choice. Localization is adopted by the application to adapt the content of a website to various regions or cultures.

<!-- more -->

`IStringLocalizer` and `IStringLocalizer<T>` were architected to improve productivity when developing localized apps. `IStringLocalizer` uses the `ResourceManager` and `ResourceReader` to provide culture-specific resources at run time. The interface has an indexer and an IEnumerable for returning localized strings. `IStringLocalizer` doesn't require storing the default language strings in a resource file. You can develop an app targeted for localization and not need to create resource files early in development. The code below shows how to wrap the string "About Title" for localization.

Register `AddLocalization` service.

```cs
// Startup.ConfigureServices

public void ConfigureServices(IServiceCollection services)
{
    services.AddControllers();
    // HERE
    services.AddLocalization();
}
```

And, Use it via `IStringLocalizer`

```cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;

namespace WebApplicationSample.Controllers
{
    [Route("api/[controller]")]
    public class AboutController : Controller
    {
        private readonly IStringLocalizer<AboutController> _localizer;

        public AboutController(IStringLocalizer<AboutController> localizer)
        {
            _localizer = localizer;
        }

        [HttpGet]
        public string Get()
        {
            return _localizer["About Title"];
        }
    }
}
```

There are three methods used to configure localization in ASP.NET Core. These include the following:

* `AddDataAnnotationsLocalization`: This method is used to provide support for DataAnnotations validation messages.
* `AddLocalization`: This method is used to add localization services to the services container.
* `AddViewLocalization`: This method is used to provide support for localized views.

## Define the Allowed Cultures

```cs
// Startup.cs

private RequestLocalizationOptions GetLocalizationOptions()
{
    var supportedCultures = new List<CultureInfo>
    {
        new CultureInfo("en-US"),
        new CultureInfo("de-DE"),
        new CultureInfo("fr-FR"),
        new CultureInfo("en-GB")
    };
    var options = new RequestLocalizationOptions
    {
        DefaultRequestCulture = new RequestCulture("en-GB"),
        SupportedCultures = supportedCultures,
        SupportedUICultures = supportedCultures
    };
    return options;
}
```

Add above option to `UseRequestLocalization` middleware

```cs
// Startup.Configure

public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
{
    if (env.IsDevelopment())
    {
        app.UseDeveloperExceptionPage();
    }
    // HERE
    app.UseRequestLocalization(GetLocalizationOptions());

    app.UseRouting();
    app.UseAuthorization();
    app.UseEndpoints(endpoints =>
    {
        endpoints.MapControllers();
    });
}
```

The middleware adds three providers for the request culture by default:

* `QueryStringRequestCultureProvider`: Gets the culture from query string values
* `CookieRequestCultureProvider`: Gets the culture from a cookie
* `AcceptLanguageHeaderRequestCultureProvider`: Gets the culture from the **Accept-Language** request header

## Create Resource Files for Each Locale

There are various ways in which you can create resource files. In this example, you'll take advantage of the Visual Studio Resource Designer to create an XML-based `.resx` file.

To specify a specific rsource folder, we should change our service settings like below

```cs
// Startup.ConfigureServices

public void ConfigureServices(IServiceCollection services)
{
    services.AddControllers();
    // HERE
    services.AddLocalization(opt => opt.ResourcesPath = "Resources");
}
```

`ResourcesPath` property has been used to set the path to the folder where resource files (for various locales) will reside. If you don't specify any value for this property, the application will expect the resource files to be available in the application's `root directory`.

Select the project in the Solution Explorer Window and create a new folder named `Resources` in it. Resources in .NET are comprised of key/value pair of data that are compiled to a `.resources` file. A resource file is one where you can store strings, images, or object data - resources of the application.

Next, add a resources file into the newly created folder. Name the resource files as 

* `Controllers.AboutController.en-GB.resx`
* `Controllers.AboutController.en-US.resx`
* `Controllers.AboutController.de-DE.resx`
* `Controllers.AboutController.fr-FR.resx`

## Resource file naming

`Resources` are named for **the full type name of their class minus the assembly name**. For example, a French resource in a project whose main assembly is `LocalizationWebsite.Web.dll` for the class `LocalizationWebsite.Web.Startup` would be named `Startup.fr.resx`. A resource for the class `LocalizationWebsite.Web.Controllers.HomeController` would be named `Controllers.HomeController.fr.resx`. If your targeted class's namespace isn't the same as the assembly name you will need the full type name. For example, in the sample project a resource for the type `ExtraNamespace.Tools` would be named `ExtraNamespace.Tools.fr.resx`.

In the sample project, the `ConfigureServices` method sets the `ResourcesPath` to "Resources", so the project relative path for the home controller's French resource file is `Resources/Controllers.HomeController.fr.resx`. Alternatively, you can use folders to organize resource files. For the about controller, the path would be `Resources/Controllers/AboutController.fr.resx`. If you don't use the `ResourcesPath` option, the `.resx` file would go in the project base directory. The resource file for `AboutController` would be named `Controllers.HomeController.fr.resx`. The choice of using the `dot` or `path` naming convention depends on how you want to organize your resource files.

In our sample, `WebApplicationSample` is the assembly name so we should create our resources inside `Resources` folder with this way.

**[NamespaceWithoutAssemblyName].[ControllerName].[Culture].resx**

Or

**[NamespaceWithoutAssemblyName]/[ControllerName].[Culture].resx**

## How to use resource files?

Write below key-values:

Controllers.AboutController.en-GB.resx

| Key             | Value     |
|-----------------|-----------|
| GreetingMessage | Hello {0} |
| SayHello        | Hello     |

Controllers.AboutController.de-DE.resx

| Key             | Value     |
|-----------------|-----------|
| GreetingMessage | Hallo {0} |
| SayHello        | Hallo     |

Now, You can use them via controllers

```cs
namespace WebApplicationSample.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AboutController : ControllerBase
    {
        private readonly IStringLocalizer<AboutController> _localizer;

        public AboutController(IStringLocalizer<AboutController> localizer)
        {
            _localizer = localizer;
        }

        // http://localhost:PORT/weatherforecast
        // http://localhost:PORT/weatherforecast?culture=en-GB
        // http://localhost:PORT/weatherforecast?culture=de-DE
        [HttpGet]
        public string Get()
        {
            return _localizer["SayHello"];

        }

        // http://localhost:PORT/weatherforecast/hamed
        // http://localhost:PORT/weatherforecast/hamed?culture=en-GB
        // http://localhost:PORT/weatherforecast/hamed?culture=de-DE
        [HttpGet("{name}")]
        public string Get(string name)
        {

            return _localizer[string.Format(_localizer["GreetingMessage"], name)];

        }
    }
}
```

`SayHello` returns a simple text based on your culture.
`GreetingMessage` returns a text but accept variable too. You can use unlimited place holders `({0} {1} {2} {3} , ...)` and pass your variables via `string.Format()`.

If `IStringLocalizer` does not find any value for the key, It will return `the key` itself as a result.

## JSON Localization Resources

You may want to use `.json` files as a resource instead of `.resx` files, so

Install below package 

```bash
Install-Package My.Extensions.Localization.Json -Version 2.1.0
dotnet add package My.Extensions.Localization.Json --version 2.1.0
<PackageReference Include="My.Extensions.Localization.Json" Version="2.1.0" />
```

Remove `services.AddLocalization();` and replace it with `services.AddJsonLocalization()`:

```cs
// Startup.ConfigureServices

using System.IO;

public void ConfigureServices(IServiceCollection services)
{
    services.AddControllers();

    // REMOVE THIS
    // services.AddLocalization(opt => opt.ResourcesPath = "Resources");

    // HERE
    services.AddJsonLocalization(opt => opt.ResourcesPath = "Resources");
}
```

Write below `JSON` files:

Controllers.AboutController.en-GB.json

```json
{
  "GreetingMessage": "Hello {0}",
  "SayHello": "Hello"
}
```

Controllers.AboutController.de-DE.json

```json
{
  "GreetingMessage": "Hallo {0}",
  "SayHello": "Hallo"
}
```

Now, You can use them via controllers

```cs

namespace WebApplicationSample.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AboutController : ControllerBase
    {
        private readonly IStringLocalizer<AboutController> _localizer;

        public AboutController(IStringLocalizer<AboutController> localizer)
        {
            _localizer = localizer;
        }

        // http://localhost:PORT/weatherforecast
        // http://localhost:PORT/weatherforecast?culture=en-GB
        // http://localhost:PORT/weatherforecast?culture=de-DE
        [HttpGet]
        public string Get()
        {
            return _localizer["SayHello"];

        }

        // http://localhost:PORT/weatherforecast/hamed
        // http://localhost:PORT/weatherforecast/hamed?culture=en-GB
        // http://localhost:PORT/weatherforecast/hamed?culture=de-DE
        [HttpGet("{name}")]
        public string Get(string name)
        {

            return _localizer[string.Format(_localizer["GreetingMessage"], name)];

        }
    }
}
```

## DataAnnotation & Localization

Install below package

```bash
Install-Package Microsoft.AspNetCore.Mvc.DataAnnotations -Version 2.2.0
dotnet add package Microsoft.AspNetCore.Mvc.DataAnnotations --version 2.2.0
<PackageReference Include="Microsoft.AspNetCore.Mvc.DataAnnotations" Version="2.2.0" />
```

You can use DataAnnotation and Localization together. Update your `ConfigureServices` as following:

```cs
// Startup.ConfigureServices

public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        // Be Careful, You must register 'AddLocalization' before 'AddDataAnnotationsLocalization' like below.
        services.AddLocalization(opt => opt.ResourcesPath = "Resources");
        services.AddControllers()
                // HERE
                .AddDataAnnotationsLocalization(options =>
                {
                    options.DataAnnotationLocalizerProvider = (type, factory) =>
                        factory.Create(typeof(DataAnnotationValidation));
                })
        ;
    }
}
```

Based on above configuration, you must add below files in `Resources` folder.

DataAnnotationValidation.en-GB.resx

| Key             | Value     |
|-----------------|-----------|
| Name | '{0}' is required |

DataAnnotationValidation.de-DE.resx

| Key             | Value     |
|-----------------|-----------|
| Name | '{0}' ist erforderlich |

We want to validate `Person` class.

```cs
// Person.cs

public class Person
{
    // The string of 'ErrorMessage' is the key.
    [Required(ErrorMessage = "Name")]
    public string Name { get; set; }
    public string FamilyName { get; set; }
    public string Address { get; set; }
    public string EmailAddress { get; set; }
    public int Age { get; set; }
}
```

And you controller will be

```cs
[ApiController]
[Route("[controller]")]
public class WeatherForecastController : ControllerBase
{
    private readonly IStringLocalizer<WeatherForecastController> _localizer;
    public WeatherForecastController(IStringLocalizer<WeatherForecastController> localizer)
    {
        _localizer = localizer;
    }

    // http://localhost:PORT/weatherforecast
    // http://localhost:PORT/weatherforecast?culture=en-GB
    // http://localhost:PORT/weatherforecast?culture=de-DE
    [HttpPost]
    public IActionResult Post([FromBody] Person person)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }
        else
        {
            return Ok();
        }
    }
}
```

And the result is

```json
{
    "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
    "title": "One or more validation errors occurred.",
    "status": 400,
    "traceId": "|82e992e6-411f3f305ff4df95.",
    "errors": {
        "Name": [
            "'Name' is required"
        ]
    }
}

{
    "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
    "title": "One or more validation errors occurred.",
    "status": 400,
    "traceId": "|82e992e5-411f3f305ff4df95.",
    "errors": {
        "Name": [
            "'Name' ist erforderlich"
        ]
    }
}
```

## DataAnnotation & JSON Localization

You can also use DataAnnotation and JSON Localization together. 

Make an emptyu class as following

```cs
public class DataAnnotationValidation
{
}
```

Update your `ConfigureServices` as following:

```cs
// Startup.ConfigureServices

public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        // Be Careful, You must register 'AddJsonLocalization' before 'AddDataAnnotationsLocalization' like below.
        services.AddJsonLocalization(opt => opt.ResourcesPath = "Resources");
        services.AddControllers()
                // HERE
                .AddDataAnnotationsLocalization(options =>
                {
                    options.DataAnnotationLocalizerProvider = (type, factory) =>
                        factory.Create(typeof(DataAnnotationValidation));
                })
        ;
    }
}
```

Then write below `JSON` files in `Resources` folder.

DataAnnotationValidation.en-GB.json

```json
{
  "Name": "'{0}' is required"
}
```

DataAnnotationValidation.de-DE.json

```json
{
  "Name": "'{0}' ist erforderlich"
}
```

We want to validate `Person` class.

```cs
// Person.cs

public class Person
{
    // The string of 'ErrorMessage' is the key.
    [Required(ErrorMessage = "Name")]
    public string Name { get; set; }
    public string FamilyName { get; set; }
    public string Address { get; set; }
    public string EmailAddress { get; set; }
    public int Age { get; set; }
}
```

And you controller will be

```cs
[ApiController]
[Route("[controller]")]
public class WeatherForecastController : ControllerBase
{
    private readonly IStringLocalizer<WeatherForecastController> _localizer;
    public WeatherForecastController(IStringLocalizer<WeatherForecastController> localizer)
    {
        _localizer = localizer;
    }

    // http://localhost:PORT/weatherforecast
    // http://localhost:PORT/weatherforecast?culture=en-GB
    // http://localhost:PORT/weatherforecast?culture=de-DE
    [HttpPost]
    public IActionResult Post([FromBody] Person person)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }
        else
        {
            return Ok();
        }
    }
}
```

And the result is

```json
{
    "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
    "title": "One or more validation errors occurred.",
    "status": 400,
    "traceId": "|82e992e6-411f3f305ff4df95.",
    "errors": {
        "Name": [
            "'Name' is required"
        ]
    }
}

{
    "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
    "title": "One or more validation errors occurred.",
    "status": 400,
    "traceId": "|82e992e5-411f3f305ff4df95.",
    "errors": {
        "Name": [
            "'Name' ist erforderlich"
        ]
    }
}
```

## FluentValidation & Localization

Install below packages

```bash
Install-Package FluentValidation -Version 9.2.2
dotnet add package FluentValidation --version 9.2.2
<PackageReference Include="FluentValidation" Version="9.2.2" />

Install-Package FluentValidation.AspNetCore -Version 9.2.0
dotnet add package FluentValidation.AspNetCore --version 9.2.0
<PackageReference Include="FluentValidation.AspNetCore" Version="9.2.0" />
```

Register `FluentValidation` as following

```cs
public void ConfigureServices(IServiceCollection services)
{
    services
        .AddControllers()        
        .AddFluentValidation() // HERE
        ;

    // HERE
    services.AddTransient<IValidator<Person>, PersonValidator>(); 
}


```

To use localization, pass `IStringLocalizer<T>` to the constructor and do the same as we explained before.

```cs
// Person.cs
public class Person {
	public string Name { get; set; }
	public string FamilyName { get; set; }
	public string Address { get; set; }
	public string EmailAddress { get; set; }
	public int Age { get; set; }
}

// PersonValidator.cs
public class PersonValidator : AbstractValidator<Person>
{
    public PersonValidator(IStringLocalizer<Person> localizer)
    {
        RuleFor(e => e.Name).MinimumLength(5)
            .WithMessage(e => string.Format(localizer[Name], nameof(e.Name)));

        RuleFor(e => e.FamilyName).MinimumLength(5)
            .WithMessage(e => string.Format(localizer[Name], nameof(e.FamilyName)));

        RuleFor(e => e.Address).MinimumLength(10).WithMessage(e => localizer[Address]);

        RuleFor(e => e.EmailAddress).EmailAddress().WithMessage(e => localizer[EmailAddress]);     
                  
        RuleFor(e => e.Age).InclusiveBetween(20, 60).WithMessage(e => localizer[Age]);
    }
}
```

## Reference(s)

Most of the information in this article has gathered from various references.

* https://docs.microsoft.com/en-us/aspnet/core/fundamentals/localization
* https://www.codemag.com/Article/2009081/A-Deep-Dive-into-ASP.NET-Core-Localization
* https://github.com/hishamco/My.Extensions.Localization.Json
* https://joonasw.net/view/aspnet-core-localization-deep-dive