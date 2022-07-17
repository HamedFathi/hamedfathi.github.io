---
title: A Professional ASP.NET Core API - Swagger
date: September 19 2020
category: aspnetcore-api
tags:
    - dotnet
    - aspnetcore
    - webapi
    - api
    - openapi
    - swagger
---


When consuming a web API, understanding its various methods can be challenging for a developer. Swagger, also known as OpenAPI, solves the problem of generating useful documentation and help pages for web APIs. It provides benefits such as interactive documentation, client SDK generation, and API discoverability.

<!-- more -->

`Swashbuckle` can be added with the following approaches:

Install the below package

```bash
Install-Package Swashbuckle.AspNetCore -Version 5.6.1
dotnet add package Swashbuckle.AspNetCore --version 5.6.1
<PackageReference Include="Swashbuckle.AspNetCore" Version="5.6.1" />
```

Add the following code 

```cs
// Startup.ConfigureServices

public void ConfigureServices(IServiceCollection services)
{
    services.AddControllers();
    
    // Register the Swagger generator, defining 1 or more Swagger documents
    services.AddSwaggerGen();
}
```

Enable the middleware for serving the generated JSON document and the Swagger UI

```cs
// Startup.Configure

public void Configure(IApplicationBuilder app)
{
    // Enable middleware to serve generated Swagger as a JSON endpoint.
    app.UseSwagger();

    // Enable middleware to serve swagger-ui (HTML, JS, CSS, etc.),
    // specifying the Swagger JSON endpoint.
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "My API V1");
    });

    app.UseRouting();
    app.UseEndpoints(endpoints =>
    {
        endpoints.MapControllers();
    });
}
```

Browse Swagger doc via below URL

`http[s]://localhost:port/swagger`

## How to use Newtonsoft.Json?

Install the below package

```bash
Install-Package Swashbuckle.AspNetCore.Newtonsoft -Version 5.6.1
dotnet add package Swashbuckle.AspNetCore.Newtonsoft --version 5.6.1
<PackageReference Include="Swashbuckle.AspNetCore.Newtonsoft" Version="5.6.1" />
```

Then

```cs
// explicit opt-in - needs to be placed after AddSwaggerGen()

services.AddSwaggerGenNewtonsoftSupport();
```

## How to set swagger on default URL?

Update the above code with the following change

```cs
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("swagger/v1/swagger.json", "My API V1");
    c.RoutePrefix = string.Empty; // HERE
});
```

Now you can browse the swagger doc url via `http[s]://localhost:port`

## How to integrate it with ReDoc?

[ReDoc](https://github.com/Redocly/redoc) is just another implementation of Swagger UI.

Install the below package

```bash
Install-Package Swashbuckle.AspNetCore.ReDoc -Version 5.6.1
dotnet add package Swashbuckle.AspNetCore.ReDoc --version 5.6.1
<PackageReference Include="Swashbuckle.AspNetCore.ReDoc" Version="5.6.1" />
```

Update your codes

```cs
public void ConfigureServices(IServiceCollection services)
{
    services.AddControllers();
    services.AddSwaggerGen();
}
 
public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
{
    app.UseSwagger();

    app.UseReDoc(c =>
    {
        c.SpecUrl("../swagger/v1/swagger.json");
    });

    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("v1/swagger.json", "My API V1");
    });

    app.UseRouting();

    app.UseEndpoints(endpoints =>
    {
        endpoints.MapControllers();
    });
}
```

Now you are able to browse them via below urls

Swagger: `http[s]://localhost:port/swagger`

ReDoc: `http[s]://localhost:port/api-docs`

## How to use XML comments with Swagger?

Right-click the project in Solution Explorer and select Edit `<project_name>.csproj`.

Manually add the following lines to the `.csproj` file:

```xml
<PropertyGroup>
    <GenerateDocumentationFile>true</GenerateDocumentationFile>
    <NoWarn>$(NoWarn);1591</NoWarn>
</PropertyGroup>
```

Then add the below code too

```cs
public void ConfigureServices(IServiceCollection services)
{
    services.AddControllers();
    services.AddSwaggerGen(c =>
    {
        // HERE
        // Set the comments path for the Swagger JSON and UI.
        var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
        var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
        c.IncludeXmlComments(xmlPath);
    });
}
```

Now you can use it like the following

```cs
/// <summary>
/// Creates a TodoItem.
/// </summary>
/// <remarks>
/// Sample request:
///
///     POST /Todo
///     {
///        "id": 1,
///        "name": "Item1",
///        "isComplete": true
///     }
///
/// </remarks>
/// <param name="item"></param>
/// <returns>A newly created TodoItem</returns>
/// <response code="201">Returns the newly created item</response>
/// <response code="400">If the item is null</response>            
[HttpPost]
[ProducesResponseType(StatusCodes.Status201Created)]
[ProducesResponseType(StatusCodes.Status400BadRequest)]
public ActionResult<TodoItem> Create(TodoItem item)
{
    _context.TodoItems.Add(item);
    _context.SaveChanges();

    return CreatedAtRoute("GetTodo", new { id = item.Id }, item);
}
```

## Annotations

Install the below package

```bash
Install-Package Swashbuckle.AspNetCore.Annotations -Version 5.6.1
dotnet add package Swashbuckle.AspNetCore.Annotations --version 5.6.1
<PackageReference Include="Swashbuckle.AspNetCore.Annotations" Version="5.6.1" />
```

Enable it

```cs
// Startup.ConfigureServices
services.AddSwaggerGen(config =>
{
   config.EnableAnnotations();
});
```

**Enrich Operation Metadata**

```cs
[HttpPost]
[SwaggerOperation(
    Summary = "Creates a new product",
    Description = "Requires admin privileges",
    OperationId = "CreateProduct",
    Tags = new[] { "Purchase", "Products" }
)]
public IActionResult Create([FromBody]Product product)
```

**Enrich Response Metadata**

```cs
[HttpPost]
[SwaggerResponse(201, "The product was created", typeof(Product))]
[SwaggerResponse(400, "The product data is invalid")]
public IActionResult Create([FromBody]Product product)
```

**Enrich Parameter Metadata**

You can annotate "path", "query" or "header" bound parameters or properties (i.e. decorated with `[FromRoute]`, `[FromQuery]` or `[FromHeader]`) with a `SwaggerParameterAttribute` to enrich the corresponding Parameter metadata that's generated by Swashbuckle:

```cs
[HttpGet]
public IActionResult GetProducts(
    [FromQuery, SwaggerParameter("Search keywords", Required = true)]string keywords)
```

**Enrich RequestBody Metadata**

You can annotate "body" bound parameters or properties (i.e. decorated with `[FromBody]`) with a `SwaggerRequestBodyAttribute` to enrich the corresponding `RequestBody` metadata that's generated by Swashbuckle:

```cs
[HttpPost]
public IActionResult CreateProduct(
    [FromBody, SwaggerRequestBody("The product payload", Required = true)]Product product)
```

**Enrich Schema Metadata**

```cs
[SwaggerSchema(Required = new[] { "Description" })]
public class Product
{
	[SwaggerSchema("The product identifier", ReadOnly = true)]
	public int Id { get; set; }

	[SwaggerSchema("The product description")]
	public string Description { get; set; }

	[SwaggerSchema("The date it was created", Format = "date")]
	public DateTime DateCreated { get; set; }
}
```

**Add Tag Metadata**

```cs
[SwaggerTag("Create, read, update and delete Products")]
public class ProductsController
{
}
```

**List Known Subtypes for Inheritance and Polymorphism**

```cs
// Startup.ConfigureServices
services.AddSwaggerGen(config =>
{
   config.EnableAnnotations(enableAnnotationsForInheritance: true, enableAnnotationsForPolymorphism: true);
});


// Shape.cs
[SwaggerSubType(typeof(Rectangle))]
[SwaggerSubType(typeof(Circle))]
public abstract class Shape
{
}
```

**Enrich Polymorphic Base Classes with Discriminator Metadata**

```cs
// Startup.ConfigureServices
services.AddSwaggerGen(config =>
{
    config.EnableAnnotations(enableAnnotationsForInheritance: true, enableAnnotationsForPolymorphism: true);
});

// Shape.cs
[SwaggerDiscriminator("shapeType")]
[SwaggerSubType(typeof(Rectangle), DiscriminatorValue = "rectangle")]
[SwaggerSubType(typeof(Circle), DiscriminatorValue = "circle")]
public abstract class Shape
{
    public ShapeType { get; set; }
}
```

## Ready to use plugins

**Swashbuckle.AspNetCore.Filters**

Some useful Swashbuckle filters which add additional documentation, e.g. request and response examples, a file upload button, etc. See its Readme for more details

```bash
Install-Package Swashbuckle.AspNetCore.Filters -Version 5.1.2
dotnet add package Swashbuckle.AspNetCore.Filters --version 5.1.2
<PackageReference Include="Swashbuckle.AspNetCore.Filters" Version="5.1.2" />
```

**Unchase.Swashbuckle.AspNetCore.Extensions**

Some useful extensions (filters), which add additional documentation, e.g. hide PathItems for unaccepted roles, fix enums for client code generation, etc. See its Readme for more details


```cs
Install-Package Unchase.Swashbuckle.AspNetCore.Extensions -Version 2.3.12
dotnet add package Unchase.Swashbuckle.AspNetCore.Extensions --version 2.3.12
<PackageReference Include="Unchase.Swashbuckle.AspNetCore.Extensions" Version="2.3.12" />
```

**MicroElements.Swashbuckle.FluentValidation**

Use FluentValidation rules instead of ComponentModel attributes to augment generated Swagger Schemas

```cs
Install-Package MicroElements.Swashbuckle.FluentValidation -Version 4.0.0
dotnet add package MicroElements.Swashbuckle.FluentValidation --version 4.0.0
<PackageReference Include="MicroElements.Swashbuckle.FluentValidation" Version="4.0.0" />
```

## Swagger & Authorization

```cs
// SwaggerBasicAuthMiddleware.cs
public class SwaggerBasicAuthMiddleware
{
    private readonly RequestDelegate _next;
    private readonly SwaggerAuthorizationOptions _options;
    public SwaggerBasicAuthMiddleware(RequestDelegate next, IOptions<SwaggerAuthorizationOptions> options)
    {
        _next = next;
        _options = options.Value;
    }
    public async Task Invoke(HttpContext context)
    {
        var segment = string.IsNullOrEmpty(_options.UrlSegment) ? "/swagger" : _options.UrlSegment;
        var redirect = string.IsNullOrEmpty(_options.RedirectUrl) ? "/Login" : _options.RedirectUrl;
        if (context.Request.Path.StartsWithSegments(segment)
            && !context.User.Identity.IsAuthenticated)
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            context.Response.Redirect(redirect);
            return;
        }
        await _next.Invoke(context);
    }
}

// SwaggerAuthorizationOptions.cs
public class SwaggerAuthorizationOptions
{
    public string RedirectUrl { get; set; }
    public string UrlSegment { get; set; }
}

// SwaggerAuthorizeExtensions.cs
public static class SwaggerAuthorizeExtensions
{
    public static IServiceCollection AddSwaggerAuthorization(this IServiceCollection service, Action<SwaggerAuthorizationOptions> options = default)
    {
        options = options ?? (opts => { });
        service.Configure(options);
        return service;
    }

    public static IApplicationBuilder UseSwaggerAuthorization(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<SwaggerBasicAuthMiddleware>();
    }
}

// Startup.ConfigureServices
public void ConfigureServices(IServiceCollection services)
{
    services.AddControllers();
    services.AddSwaggerGen();
    services.AddSwaggerAuthorization(option =>
    {
        option.RedirectUrl = "/Login";
        option.UrlSegment = "/swagger";
    });
}

// Startup.Configure
public void Configure(IApplicationBuilder app)
{
    app.UseRouting();
    app.UseAuthorization();
    app.UseAuthentication();

    // HERE
    // Becarful, It should be after UseAuthorization & UseAuthentication middlewares.
    app.UseSwaggerAuthorization();

    // Enable middleware to serve generated Swagger as a JSON endpoint.
    app.UseSwagger();

    // Enable middleware to serve swagger-ui (HTML, JS, CSS, etc.),
    // specifying the Swagger JSON endpoint.
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "My API V1");
    });

    app.UseEndpoints(endpoints =>
    {
        endpoints.MapControllers();
    });
}
```



## Reference(s)

Most of the information in this article has gathered from various references.

* https://docs.microsoft.com/en-us/aspnet/core/tutorials/getting-started-with-swashbuckle
* http://stevenmaglio.blogspot.com/2019/12/using-swagger-ui-and-redoc-in-aspnet.html
* https://github.com/domaindrivendev/Swashbuckle.AspNetCore
* https://github.com/mattfrear/Swashbuckle.AspNetCore.Filters