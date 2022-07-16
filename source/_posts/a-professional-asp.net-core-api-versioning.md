---
title: A Professional ASP.NET Core API - Versioning
date: September 21 2020
category: aspnetcore-api
tags:
    - dotnet
    - aspnetcore
    - webapi
    - api
    - versioning
---

When developing APIs, you should keep one thing in mind: **Change is inevitable**. When your API has reached a point where you need to add more responsibilities, you should consider versioning your API. Hence you will need a versioning strategy.

<!-- more -->

Install the below package

```bash
Install-Package Microsoft.AspNetCore.Mvc.Versioning -Version 4.1.1
dotnet add package Microsoft.AspNetCore.Mvc.Versioning --version 4.1.1
<PackageReference Include="Microsoft.AspNetCore.Mvc.Versioning" Version="4.1.1" />
```

## Configure API versioning

```cs
// Startup.ConfigureServices
using Microsoft.AspNetCore.Mvc.Versioning;

public void ConfigureServices(IServiceCollection services)
{
    services.AddApiVersioning(config =>
    {
        // You can specify the default version as 1.0.
        config.DefaultApiVersion = new ApiVersion(1, 0);
        // Set defaul version if you dont specify it.
        config.AssumeDefaultVersionWhenUnspecified = true;
        // Let the clients of the API know all supported versions.
        // The consumers could read the 'api-supported-versions' header.
        config.ReportApiVersions = true;
        config.ApiVersionReader = new HeaderApiVersionReader("x-api-version");
    });
}
```

if you don't set these two configurations

```cs
config.DefaultApiVersion = new ApiVersion(1, 0);
config.AssumeDefaultVersionWhenUnspecified = true;
```

And don't set any version for your Controller/Action, You will get the following error when you send a request.

```json
{
    "error": {
        "code": "ApiVersionUnspecified",
        "message": "An API version is required, but was not     
specified.",
        "innerError": null
    }
}
```

## API Version Reader

API Version Reader defines how an API version is read from the HTTP request. If not explicitly configured, the default setting is that our API version will be a query string parameter named `v` (example: ../users?v=2.0). Another, probably more popular option is to store the API version in the HTTP header. We have also the possibility of having an API version both in a query string as well as in an HTTP header.

**Query string parameter**

```cs
// /api/home?v=2.0
config.ApiVersionReader = new QueryStringApiVersionReader("v");
```

**HTTP header**

```cs
// x-api-version: 2.0
config.ApiVersionReader = new HeaderApiVersionReader("x-api-version");
```

**Media type**

```cs
// Content-Type: text/plain; charset=utf-8; v=2
// Content-Type: application/json; charset=utf-8; v=2
config.ApiVersionReader = new MediaTypeApiVersionReader();

// Content-Type: text/plain; charset=utf-8; version=2
// Content-Type: application/json; charset=utf-8; version=2
config.ApiVersionReader = new MediaTypeApiVersionReader("version"));
```

**API Version Reader Composition**

```cs
config.ApiVersionReader = ApiVersionReader.Combine(
        new QueryStringApiVersionReader("v"),
        new HeaderApiVersionReader("x-api-version"),
        new MediaTypeApiVersionReader("version")
);
```

**The URL Path**

```cs
// [Route("api/v{version:apiVersion}/[controller]")]  
config.ApiVersionReader = new UrlSegmentApiVersionReader();
```

##  Set version(s) to Controllers and Actions 

Consider the following example:

```cs
[ApiController]
// api-supported-versions: 1.1, 2.0
// api-deprecated-versions: 1.0
[ApiVersion("1.0", Deprecated = true)]
[ApiVersion("1.1")]
[ApiVersion("2.0")]
// api/v2/values/4
// api/v2.0/values/4
[Route("api/v{version:apiVersion}/[controller]")]
public class ValuesController : ControllerBase
{
    // GET api/v1/values
    [HttpGet]
    public ActionResult<IEnumerable<string>> Get()
    {
        return new string[] { "value1", "value2" };
    }

    // GET api/v2/values/5
    // GET api/v2.0/values/5
    [HttpGet("{id}")]
    [MapToApiVersion("2.0")]
    public ActionResult<string> Get(int id)
    {
        return "value";
    }

    // POST api/v1/values/5
    // POST api/v1.0/values/5
    // POST api/v1.1/values/5
    // POST api/v2/values/5
    // POST api/v2.0/values/5
    [HttpPost("{id}")]
    public ActionResult<string> Post(int id)
    {
        return "value";
    }
}
```

**Tip:** Since no version number is specified to the actions in `ValuesController`, all the endpoints are assumed to have the default version of `1.0`.

**[ApiVersion("1.0", Deprecated = true)]**

Annotating our controller with, for example, [ApiVersion("1.0")] attribute, means that this controller supports API version 1.0.

To deprecate some version in our API controller, we need to set Deprecated flag to true: [ApiVersion("1.0", Deprecated = true)].

In such cases a `api-deprecated-versions` header will be added to identify deprecated versions.

**[ApiVersion("1.1")]**

**[ApiVersion("2.0")]**

Controllers can support multiple API versions.

**[Route("api/v{version:apiVersion}/[controller]")]**

To implement URL path versioning, You can modify the Route attribute of the controllers to accept API versioning info in the path param.

**[MapToApiVersion("2.0")]**

From the several versions introduced for the controller, you can specify a specific version (eg. version 2.0) for the action. The action is **only** available with this version.

If you try to access it with other versions, you will encounter an `UnsupportedApiVersion` error.

```json
{
    "error": {
        "code": "UnsupportedApiVersion",
        "message": "The HTTP resource that matches the request URI 'http://localhost:5000/api/v1.0/values/4' does not support the API version '1.0'.",
        "innerError": null
    }
}
```

**[ApiVersionNeutral]**

If we have a service that is version-neutral, we will mark that controller with `[ApiVersionNeutral]` attribute.


**How to get the API version inside a controller?**

```cs
var apiVersion = HttpContext.GetRequestedApiVersion();
```

And also

```cs
public IActionResult Get( int id, ApiVersion apiVersion ) {}
```

## API Version Conventions

Besides attributing our controllers and methods, another way to configure service versioning is with API versioning conventions. There are several reasons why would we use API versioning conventions instead of attributes:

* Centralized management and application of all service API versions
* Apply API versions to services defined by controllers in external .NET assemblies
* Dynamically apply API versions from external sources; for example, from the configuration

```cs
services.AddApiVersioning(config =>
{
    config.Conventions.Controller<MyController>().HasApiVersion(1, 0);
});
```

Here's an example of setting deprecated API version as well as versioning controller actions:

```cs
services.AddApiVersioning(config =>
{
    config.Conventions.Controller<MyController>()	   
                       .HasDeprecatedApiVersion(1, 0)
                       .HasApiVersion(1, 1)
                       .HasApiVersion(2, 0)
                       .Action(c => c.Get1_0()).MapToApiVersion(1, 0)
                       .Action(c => c.Get1_1()).MapToApiVersion(1, 1)
                       .Action(c => c.Get2_0()).MapToApiVersion(2, 0);
});
```

There is also an option to define custom conventions.There is a `IControllerConvention` interface for this purpose. Custom conventions are added to the convention builder through the API versioning options:

```cs
services.AddApiVersioning(config =>
{
    config.Conventions.Add(new MyCustomConvention());
});
```

## How to prevent an unavailable or deprecated api version from loading?

Consider the following example

```cs
[ApiController]
[ApiVersion("1.1")]
[ApiVersion("2.0")]
[Route("api/v{version:apiVersion}/[controller]")]
public class ValuesController : ControllerBase
{
    // GET api/v1/values
    [HttpGet]
    [MapToApiVersion("1.0")]
    public ActionResult<IEnumerable<string>> Get()
    {
        return new string[] { "value1", "value2" };
    }

    [HttpGet("{id}")]
    [MapToApiVersion("2.0")]
    public ActionResult<string> Get(int id)
    {
        return "value";
    }
}
```

In this example, we have two valid versions (`1.1`, `2.0`) for all actions but the `Get()` has mapped to version `1.0` which is invalid for us. We want to prevent this method from loading.

To do this, you should write an `ActionFilterAttribute` as following

```cs
// UnavailableApiVersion.cs

public class UnavailableApiVersion
{
    public string Code { get; set; }
    public string Message { get; set; }
    public IEnumerable<string> AvailableVersions { get; set; }
    public IEnumerable<string> DeprecatedVersions { get; set; }
    public UnavailableApiVersion()
    {
        AvailableVersions = new List<string>();
        DeprecatedVersions = new List<string>();
    }
}   

// PreventUnavailableApiVersionsAttribute.cs

[AttributeUsage(AttributeTargets.Class)]
public class PreventUnavailableApiVersionsAttribute : ActionFilterAttribute
{
    public string Header { get; set; } = "x-api-version";
    public string QueryString { get; set; } = "v";
    public string UrlSegment { get; set; } = "version";
    public bool IsADeprecatedVersionValid { get; set; } = true;
    private string GetUrl(HttpRequest request)
    {
        return $"{request.Scheme}://{request.Host}{request.Path}{request.QueryString}";
    }
    public override void OnActionExecuting(ActionExecutingContext context)
    {
        var props = context.ActionDescriptor.Properties;
        var url = GetUrl(context.HttpContext.Request);
        var headerVersion = context.HttpContext.Request.Headers.Count(x => string.Equals(x.Key, Header.Trim(), StringComparison.InvariantCultureIgnoreCase));
        var routeVersion = context.RouteData.Values[UrlSegment.Trim()];
        var queryVersion = context.HttpContext.Request.QueryString.Value.Trim();
        var matchedQuery = queryVersion.Replace("?", "").Split('&').FirstOrDefault(x => x.StartsWith($"{QueryString}="));
        var isSkippable = routeVersion == null && headerVersion == 0 && string.IsNullOrEmpty(matchedQuery);
        if (isSkippable) return;
        var version = "";
        if (routeVersion != null)
        {
            version = routeVersion.ToString();
        }
        if (headerVersion > 0)
        {
            version = context.HttpContext.Request.Headers["x-api-version"].ToString();
        }
        if (!string.IsNullOrEmpty(matchedQuery))
        {
            version = matchedQuery.Replace($"{QueryString}=", "");
        }
        version = version.Contains('.') ? version : $"{version}.0";
        foreach (var prop in props)
        {
            var apiVersionModel = prop.Value as ApiVersionModel;
            if (apiVersionModel != null)
            {
                if (apiVersionModel.IsApiVersionNeutral) return;
                var deprecated = apiVersionModel.DeprecatedApiVersions.Select(x => x.ToString());
                var impl = apiVersionModel.ImplementedApiVersions.Select(x => x.ToString());
                var supported = apiVersionModel.SupportedApiVersions.Select(x => x.ToString());
                var isSupported = IsADeprecatedVersionValid ? impl.Contains(version) : supported.Contains(version);
                if (!isSupported)
                {
                    context.Result = new JsonResult(new UnavailableApiVersion
                    {
                        Code = "UnavailableApiVersion",
                        AvailableVersions = supported,
                        DeprecatedVersions = deprecated,
                        Message = $"The HTTP resource that matches the request URI '{url}' does not available via the API version '{version}'."
                    });
                    context.HttpContext.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                }
            }
        }
    }
}
```

And consume it on top of your controller

```cs
[PreventUnavailableApiVersions]
[ApiController]
[ApiVersion("1.1")]
[ApiVersion("2.0")]
[Route("api/v{version:apiVersion}/[controller]")]
public class ValuesController : ControllerBase
{
    // GET api/v1/values
    [HttpGet]
    [MapToApiVersion("1.0")]
    public ActionResult<IEnumerable<string>> Get()
    {
        return new string[] { "value1", "value2" };
    }

    [HttpGet("{id}")]
    [MapToApiVersion("2.0")]
    public ActionResult<string> Get(int id)
    {
        return "value";
    }
}
```

Now, whenever you call the `Get()` action, the `PreventUnavailableApiVersions` checks the version you requested (`1.0`) with versions  of your controller (`1.1`, `2.0`), If the requested version is not in the list, it returns the same error as below.

```json
// Status code: 400 Bad Request
{
    "code": "UnavailableApiVersion",
    "message": "The HTTP resource that matches the request URI 'http://localhost:5000/api/v1/WeatherForecast?v=1.0' does not available by the API version '1.0'.",
    "availableVersions": [
        "1.1",
        "2.0"
    ],
    "deprecatedVersions": [
        "1.0"
    ]
}
```

**Deprecated versions**

As a default behaviour deprecated versions are in valid list it means if you write like the below code

```cs
[PreventUnavailableApiVersions]
[ApiController]
[ApiVersion("1.0", Deprecated = true)]
[ApiVersion("1.1")]
[ApiVersion("2.0")]
[Route("api/v{version:apiVersion}/[controller]")]
public class ValuesController : ControllerBase
{
    // GET api/v1/values
    [HttpGet]
    [MapToApiVersion("1.0")]
    public ActionResult<IEnumerable<string>> Get()
    {
        return new string[] { "value1", "value2" };
    }

    [HttpGet("{id}")]
    [MapToApiVersion("2.0")]
    public ActionResult<string> Get(int id)
    {
        return "value";
    }
}
```

You will see the result of action method without any unavailable error but you can config to remove deprecated versions from list of valid versions.
You just need to write

```cs
// IsADeprecatedVersionValid: default is true
[PreventUnavailableApiVersions(IsADeprecatedVersionValid = false)]
```

Now, the action filter consider the version `1.0` as an unavailable and you will get an `UnavailableApiVersion` response.

**Configuration**

`PreventUnavailableApiVersions` action filter supports `header`, `query string` and `url segment` mode so you can configure any of these just like what you did in `ApiVersionReader`.

```cs
// Default is 'v'
// QueryStringApiVersionReader("ver")
[PreventUnavailableApiVersions(QueryString = "ver")] 

// Default is 'x-api-version'
// HeaderApiVersionReader("api-version-header")
[PreventUnavailableApiVersions(Header = "api-version-header")]

// UrlSegmentApiVersionReader
// Default is 'version', [Route("api/v{version:apiVersion}/[controller]")]
// [Route("api/v{myversion:apiVersion}/[controller]")]
[PreventUnavailableApiVersions(UrlSegment = "myversion")] 
```

**A Second way!**

Always you can find an easier way so you can rewrite the above action filter as following

```cs
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class UnavailableApiVersionsAttribute : ActionFilterAttribute
{
    private string GetUrl(HttpRequest request)
    {
        return $"{request.Scheme}://{request.Host}{request.Path}{request.QueryString}";
    }
    private string FixVersion(string version)
    {
        var v = version.Contains('.') ? version : $"{version}.0";
        return v.Trim();
    }
    private readonly string _commaSeparatedVersions;
    public UnavailableApiVersionsAttribute(string commaSeparatedVersions)
    {
        _commaSeparatedVersions = commaSeparatedVersions;
    }
    public string Header { get; set; } = "x-api-version";
    public string QueryString { get; set; } = "v";
    public string UrlSegment { get; set; } = "version";
    public bool IsADeprecatedVersionValid { get; set; } = true;
    public override void OnActionExecuting(ActionExecutingContext context)
    {
        if (string.IsNullOrEmpty(_commaSeparatedVersions)) return;
        var props = context.ActionDescriptor.Properties;
        var url = GetUrl(context.HttpContext.Request);
        var headerVersion = context.HttpContext.Request.Headers.Count(x => string.Equals(x.Key, Header.Trim(), StringComparison.InvariantCultureIgnoreCase));
        var routeVersion = context.RouteData.Values[UrlSegment.Trim()];
        var queryVersion = context.HttpContext.Request.QueryString.Value.Trim();
        var matchedQuery = queryVersion.Replace("?", "").Split('&').FirstOrDefault(x => x.StartsWith($"{QueryString}="));
        var isSkippable = routeVersion == null && headerVersion == 0 && string.IsNullOrEmpty(matchedQuery);
        if (isSkippable) return;
        var version = "";
        if (routeVersion != null)
        {
            version = routeVersion.ToString();
        }
        if (headerVersion > 0)
        {
            version = context.HttpContext.Request.Headers["x-api-version"].ToString();
        }
        if (!string.IsNullOrEmpty(matchedQuery))
        {
            version = matchedQuery.Replace($"{QueryString}=", "");
        }
        version = FixVersion(version);
        var unavailableVersions = _commaSeparatedVersions.Split(',').Select(x => FixVersion(x.Trim()));
        var isUnavailableVersion =  unavailableVersions.Contains(version);
        foreach (var prop in props)
        {
            var apiVersionModel = prop.Value as ApiVersionModel;
            if (apiVersionModel != null)
            {
                if (apiVersionModel.IsApiVersionNeutral) return;
                var deprecated = apiVersionModel.DeprecatedApiVersions.Select(x => x.ToString());
                var supported = IsADeprecatedVersionValid ?
                    apiVersionModel.SupportedApiVersions.Select(x => x.ToString()).Concat(deprecated).Except(unavailableVersions) :
                    apiVersionModel.SupportedApiVersions.Select(x => x.ToString()).Except(unavailableVersions);
                if(!isUnavailableVersion && !IsADeprecatedVersionValid)
                {
                    isUnavailableVersion = deprecated.Contains(version);
                }
                if (isUnavailableVersion)
                {
                    context.Result = new JsonResult(new UnavailableApiVersion
                    {
                        Code = "UnavailableApiVersion",
                        AvailableVersions = supported,
                        DeprecatedVersions = deprecated,
                        Message = $"The HTTP resource that matches the request URI '{url}' does not available via the API version '{version}'."
                    });
                    context.HttpContext.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                }
            }
        }
    }
}
```

`UnavailableApiVersions` attribute get a comma-separated versions via constructor just on action methods. When you use this action filter you cannot access to the api via these forbidden versions.

So you should consume it like below code

```cs
[ApiController]
[ApiVersion("1.0", Deprecated = true)]
[ApiVersion("1.1")]
[ApiVersion("2.0")]
[Route("api/v{version:apiVersion}/[controller]")]
public class ValuesController : ControllerBase
{
    // GET api/v1/values
    [HttpGet]
    [MapToApiVersion("1.0")]
    [UnavailableApiVersions("1.0,1.1")]
    public ActionResult<IEnumerable<string>> Get()
    {
        return new string[] { "value1", "value2" };
    }

    [HttpGet("{id}")]
    [MapToApiVersion("2.0")]
    public ActionResult<string> Get(int id)
    {
        return "value";
    }
}
```

You can use `UnavailableApiVersionsAttribute` on any controller or action method.

**Global registration**

Also, You are able to register the `UnavailableApiVersionsAttribute` filter globally.

```cs
// Startup.ConfigureServices
public void ConfigureServices(IServiceCollection services)
{
    services.AddControllers(options =>
    {
        // HERE
        options.Filters.Add(new UnavailableApiVersionsAttribute("1.0,1.1") { IsADeprecatedVersionValid = false });
    });
}
```

## Swagger integration

Install the below packages

```bash
Install-Package Microsoft.AspNetCore.Mvc.Versioning.ApiExplorer -Version 4.1.1
dotnet add package Microsoft.AspNetCore.Mvc.Versioning.ApiExplorer --version 4.1.1
<PackageReference Include="Microsoft.AspNetCore.Mvc.Versioning.ApiExplorer" Version="4.1.1" />
```

Add `ConfigureSwaggerOptions` to make some custom options.

```cs
// ConfigureSwaggerOptions.cs

/// <summary>
///     Configures the Swagger generation options.
/// </summary>
/// <remarks>
///     This allows API versioning to define aSwagger document per API version after the
///     <see cref="IApiVersionDescriptionProvider" />service has been resolved from the service container.
/// </remarks>
public sealed class ConfigureSwaggerOptions :IConfigureOptions<SwaggerGenOptions>
{
    private readonly IApiVersionDescriptionProvider _provider;
    /// <summary>
    ///     Initializes a new instance of the <see cref="ConfigureSwaggerOptions" /> class.
    /// </summary>
    /// <param name="provider">
    ///     The <see cref="IApiVersionDescriptionProvider">provider</see> used to generate Swagger
    ///     documents.
    /// </param>
    public ConfigureSwaggerOptions(IApiVersionDescriptionProvider provider) => _provider = provider;
    /// <inheritdoc />
    public void Configure(SwaggerGenOptions options)
    {
        // add a swagger document for each discovered API version
        // note: you might choose to skip or document deprecated API versions differently
        foreach (ApiVersionDescription description in _provider.ApiVersionDescriptions)
        {
            options.SwaggerDoc(description.GroupName, CreateInfoForApiVersion(description));
        }
    }
    private static OpenApiInfo CreateInfoForApiVersion(ApiVersionDescription description)
    {
        var info = new OpenApiInfo
        {
            Title = "A Web API",
            Version = description.ApiVersion.ToString(),
            Description = "An API sample.",
            Contact = new OpenApiContact { Name = "hamedfathi", Email = "hamedfathi@outlook.com" },
            TermsOfService = new Uri("https://hamedfathi.me"),
            License = new OpenApiLicense
            {
                Name = "MIT License",
                Url = new Uri("https://opensource.org/licenses/MIT")
            }
        };
        if (description.IsDeprecated)
        {
            info.Description += " This API version has been deprecated.";
        }
        return info;
    }
}
```

Modify your `Startup.cs` as following

```cs
// Startup.ConfigureServices
public void ConfigureServices(IServiceCollection services)
{
    services.AddControllers();

    services.AddTransient<IConfigureOptions<SwaggerGenOptions>, ConfigureSwaggerOptions>();
    services.AddSwaggerGen(c =>
    {
        var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
        var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
        c.IncludeXmlComments(xmlPath);
    }); 
	services.AddApiVersioning(config =>
    {
        config.DefaultApiVersion = new ApiVersion(1, 0);
        config.AssumeDefaultVersionWhenUnspecified = true;
        config.ReportApiVersions = true;
        config.ApiVersionReader = new UrlSegmentApiVersionReader();
    });
    services.AddVersionedApiExplorer(
       options =>
       {
           // add the versioned api explorer, which also adds IApiVersionDescriptionProvider service
           // note: the specified format code will format the version as "'v'major[.minor][-status]"
           options.GroupNameFormat = "'v'VVV";

           // note: this option is only necessary when versioning by url segment. the SubstitutionFormat
           // can also be used to control the format of the API version in route templates
           options.SubstituteApiVersionInUrl = true;
       });

}

// Startup.Configure
public void Configure(IApplicationBuilder app, IWebHostEnvironment env, IApiVersionDescriptionProvider provider)
{
    app.UseSwagger();
    app.UseSwaggerUI(
        options =>
        {
            foreach (ApiVersionDescription description in provider.ApiVersionDescriptions)
            {
                string swaggerEndpoint;

                string basePath = Configuration["ASPNETCORE_BASEPATH"];
                Console.WriteLine("PATH: " + basePath);
                if (!string.IsNullOrEmpty(basePath))
                {
                    swaggerEndpoint = $"{basePath}/swagger/{description.GroupName}/swagger.json";
                }
                else
                {
                    swaggerEndpoint = $"/swagger/{description.GroupName}/swagger.json";
                }

                options.SwaggerEndpoint(swaggerEndpoint, description.GroupName.ToUpperInvariant());
            }
        });

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

* https://www.infoworld.com/article/3562355/how-to-use-api-versioning-in-aspnet-core.html
* https://dev.to/99darshan/restful-web-api-versioning-with-asp-net-core-1e8g
* https://dotnetcoretutorials.com/2017/01/17/api-versioning-asp-net-core/
* https://exceptionnotfound.net/overview-of-api-versioning-in-asp-net-core-3-0/
* https://github.com/microsoft/aspnet-api-versioning/wiki/API-Version-Reader
* 