---
title: A Professional ASP.NET Core - Model Binding
date: October 10 2020
category: aspnetcore
tags:
    - dotnet
    - aspnetcore
    - webapi
    - model
    - binding
    - modelbinding
---

Controllers and Razor pages work with data that comes from HTTP requests. For example, route data may provide a record key, and posted form fields may provide values for the properties of the model. Writing code to retrieve each of these values and convert them from strings to .NET types would be tedious and error-prone. Model binding automates this process. The `model binding` system:

* Retrieves data from various sources such as route data, form fields, and query strings.
* Provides the data to controllers and Razor pages in method parameters and public properties.
* Converts string data to .NET types.
* Updates properties of complex types.

<!-- more -->

## HTTP Request

HTTP is one of the many protocols (strategies of communication) used to transfer data from one machine to another across the internet. It is the protocol that browsers primarily use to communicate with websites.

For instance, when you go to `www.wikipedia.org`, an HTTP request is created and transmitted to Wikipedia's servers, which in turn render and transmit an HTTP response back to the browser.
The HTTP protocol is a "text-based protocol", which means that this strategy uses human-readable characters as its means of communication.

An HTTP request defines the following:

* **Method** (required) — (Example: GET)
* **Host** (required) — (Example: `www.hamedfathi.me`)
* **Path** (required) —(Example: /search)
* **HTTP version** (required) — (Example: HTTP/2)
* **Headers** (optional) — (Example: Content-Type: application/json)
* **Query** String (optional) — (Example: ?q=test)
* **Body** (optional) — (Example: {"q": "test"})

## Model Binding Sources

By default, model binding gets data in the form of key-value pairs from the following sources in an HTTP request (**in order**):

| Order | Approach                                                                        |
|:-----:|---------------------------------------------------------------------------------|
| 1     | Form fields                                                                     |
| 2     | The request body (For `controllers` that have the `[ApiController]` attribute.) |
| 3     | Route data                                                                      |
| 4     | Query string parameters                                                         |
| 5     | Uploaded files                                                                  |

Therefore, model binding engine will try to use any of the above sources that are available in order, unless you refer to a specific source

For each target parameter or property, the sources are scanned in the order indicated in the preceding list. There are a few exceptions:

* Route data and query string values are used `only` for simple types.
* Uploaded files are bound `only` to target types that implement `IFormFile` or `IEnumerable<IFormFile>`.

If the default source is not sufficient or is not what you want, use one of the following attributes to specify the source:

**Override binding source**

| Attribute      | Description                                          |
|----------------|------------------------------------------------------|
| [FromQuery]    | Gets values from the URL query string.               |
| [FromRoute]    | Gets values from route data.                         |
| [FromForm]     | Gets values from posted form fields. (via HTTP POST) |
| [FromBody]     | Gets values from the request body, based on configured formatter (e.g. JSON, XML). Only one action parameter can have this attribute.                |
| [FromHeader]   | Gets values from HTTP headers.                       |
| [FromServices] | Gets values from DI.                                 |

**Override binding behavior**

| Attribute      | Description                                                                |
|----------------|----------------------------------------------------------------------------|
| [Bind]         | Specifies which properties of a model should be included in model binding. |
| [BindRequired] | Add model state error if binding fails.                                    |
| [BindNever]    | Ignore the binding of parameter.                                           |

**Supply custom binding**

| Attribute     | Description                             |
|---------------|-----------------------------------------|
| [ModelBinder] | provide custom model binder.            |

## Model Binding for Simple Types

When Binding Simple Types the framework convert the values into the types of action method's arguments. The Simple Types are: `Boolean`, `Byte`, `SByte`, `Char`, `DateTime`, `DateTimeOffset`, `Decimal`, `Double`, `Enum`, `Guid`, `Int16`, `Int32`, `Int64`, `Single`, `TimeSpan`, `UInt16`, `UInt32`, `UInt64`, `Uri`, `Version`.

## Model Binding for Complex Types

When the argument of the action method is a `complex type like a class object` then Model Binding process gets all the `public properties` of the complex type and performs the `binding for each of them`.

## Default Binding Values

You may wonder what will happen if ASP.NET Core framework does not find the values of the action method's argument in any of the three locations – `Form data values`, `Routing variables` & `Query strings`. In that case it will provide the default values based on the type of the action method's argument. These are:

* For `value types`, the value will be `default(T)`
* `0` for `int`, `float`, `decimal`, `double`, `byte`.
* `01-01-0001 00:00:00` for `DateTime`.
* Nullable simple types are set to `null`.
* `Nullable types` are `null`.
* `null` for `string`.
* For `complex Types (reference types)`, model binding creates an instance by using the default constructor, without setting properties.
* Arrays are set to `Array.Empty<T>()`, except that `byte[]` arrays are set to `null`.

## Form fields

A `ProductEditModel` object, which contains the details of the product that needs to be created or edited.

**View model**

```cs
// ProductEditModel.cs

public class ProductEditModel
{
  public int Id { get; set; }
  public string Name { get; set; }
  public decimal Rate { get; set; }
  public int Rating { get; set; }
}
```

A `form` is created to which contains three form fields. `Name`, `Rate` and `Rating`.

There are three ways front of us:

**Standard HTML**

```html
@model ProductEditModel
@{
    Layout = "_Layout";
    ViewData["Title"] = "Index";
}

<h2>Product</h2>

<form action="/Home/Create" method="post">
    <label for="Name">Name</label>
    <input type="text" name="Name" />

    <label for="Rate">Rate</label>
    <input type="text" name="Rate" />

    <label for="Rating">Rating</label>
    <input type="text" name="Rating" />

    <input type="submit" name="submit" />
</form>
```

**HTML Helper**

```html
@model ProductEditModel
@{
    Layout = "_Layout";
    ViewData["Title"] = "Index";
}

<h2>Product</h2>

@using (Html.BeginForm("Create", "Home", FormMethod.Post))
{
    <label for="Name">Name</label>
    <input type="text" name="Name" />

    <label for="Rate">Rate</label>
    <input type="text" name="Rate" />

    <label for="Rating">Rating</label>
    <input type="text" name="Rating" />

    <input type="submit" name="submit" />
}
```

**Tag Helper**

```html
@model ProductEditModel
@{
    Layout = "_Layout";
    ViewData["Title"] = "Index";
}

<h2>Product</h2>

<form asp-controller="Home" asp-action="Create" method="post">
    <label for="Name">Name</label>
    <input type="text" name="Name" />

    <label for="Rate">Rate</label>
    <input type="text" name="Rate" />

    <label for="Rating">Rating</label>
    <input type="text" name="Rating" />

    <input type="submit" name="submit" />
</form>
```

**Route Tag Helper**

```html
@model ProductEditModel
@{
    Layout = "_Layout";
    ViewData["Title"] = "Index";
}

<h2>Product</h2>

<form asp-route="MyCreateRoute" method="post">
    <label for="Name">Name</label>
    <input type="text" name="Name" />

    <label for="Rate">Rate</label>
    <input type="text" name="Rate" />

    <label for="Rating">Rating</label>
    <input type="text" name="Rating" />

    <input type="submit" name="submit" />
</form>
```

If you use above approach, you must set below attribute to your action:

```cs
[Route("/Home/Create", Name = "MyCreateRoute")]
```

**Action**

The `Create` action method in the `HomeController`.

```cs
[HttpPost]
// Just for 'Route Tag Helper' approach
// [Route("/Home/Create", Name = "MyCreateRoute")]
public IActionResult Create(ProductEditModel model)
{
    string message = "";
 
    if (ModelState.IsValid)
    {
        message = "product " + model.Name + " created successfully" ;
    }
    else
    {
        message = "Failed to create the product. Please try again";
    }
    return Content(message);
}
```

Now, When you click on the `submit` button your form information will be sent to the `Create` action and binds to the `ProductEditModel` model based on its `public properties` and corresponding HTML `name` tags.

## Request body

`Request Body` is the part of the HTTP Request where additional content can be sent to the server.

You can use `Postman` to test this approach easily.

![](/images/a-professional-asp.net-core-model-binding/postman.png)

**Request body message**

Our `ProductEditModel` model to create:


```js
// POST http://localhost:PORT/Home/Create
// Body > raw

{
  "name": "hamed",
  "rate": 20.0,
  "rating": 100
}
```

**MVC**

If you are using a `MVC` application, you must add `[FromBody]` on your `model`.

```cs
[HttpPost]
public IActionResult Create([FromBody] ProductEditModel model)
{
    string message = "";

    if (ModelState.IsValid)
    {
        message = "product " + model.Name + " created successfully";
    }
    else
    {
        message = "Failed to create the product. Please try again";
    }
    return Content(message);
}
```

**API**

If you are using an `API` application, you must add `[ApiController]` on your `controller`.

```cs
[ApiController]
public class HomeController : ControllerBase
{
    [HttpPost]
    public IActionResult Create(ProductEditModel model)
    {
        string message = "";

        if (ModelState.IsValid)
        {
            message = "product " + model.Name + " created successfully";
        }
        else
        {
            message = "Failed to create the product. Please try again";
        }
        return Content(message);
    }
}
```

## Route data

`Route values` obtain from `URL segments` or through default values after
matching a route.

**Using optional and default values**

```html
api/{controller}/{action=index}/{id?}
```

* `api`: A literal segment.
* `{controller}`: A requierd route parameter.
* `{action=index}` An optional route parameter with default value if not provided.
* `{id?}`: An optional route parameter.

**Note:** A `segment` is a small contiguous section of a URL. It’s separated from other URL segments by at least one character, often by the `/` character. e.g. `{id}` and `{dogsOnly}` in below example.

Suppose you have the following action method:

```cs
[HttpGet("{id}/{dogsOnly}")] // Route
public ActionResult<Pet> GetById(int id, bool dogsOnly) {}
```

And the app receives a request with this URL:

```html
http://example.com/api/pets/2/true
```

Model binding goes through the following steps after the routing system selects the action method:

* Finds the first parameter of `GetByID`, an integer named id.
* Looks through the available sources in the HTTP request and finds `id = "2"` in route data.
* Converts the string "2" into integer 2.
* Finds the second parameter of `GetByID`, an boolean named dogsOnly.
* Looks through the available sources in the HTTP request and finds `dogsOnly = "true"` in route data.
* Converts the string "true" into boolean true.

**Complex types**

You are able to write route binding for complex type as following:

Create a model binding class

```cs
public class DetailsQuery
{
  [Required]
  public int? ClockNumber { get; set; }
  [Required]
  public int? YearFrom { get; set; }
  [Required]
  public int? YearTo { get; set; }
  [FromQuery] // From query string
  public bool CheckHistoricalFlag { get; set; } = false;
}
```

The action is

```cs
// http://localhost:PORT/api/employees/10/calendar/1966/2009?checkhistoricalflag=true

[HttpGet("/api/employees/{clockNumber:int}/calendar/{yearFrom:int}/{yearTo:int}")]
public ActionResult Get([FromRoute] DetailsQuery query)
{
  return Ok();
}
```

As you can see the binding engine can map each of `DetailsQuery` properties from URL segments.

**Constraints**

You can apply a large number of route constraints to route templates to ensure that route values are convertible to appropriate types. 

| Constraint              | Example              | Match examples                       | Description                                  |
|-------------------------|----------------------|--------------------------------------|----------------------------------------------|
| int                     | {count:int}          | 678, -890, 0                         | Matches any integer                          |
| decimal                 | {rate:decimal}       | 12.3, 88, -5.005                     | Matches any decimal value                    |
| Guid                    | {id:guid}            | 48ac5fbd-fd24-43b5-a742-6aab7fad67f9 | Matches any Guid                             |
| min(value)              | {age:min(22)}        | 18, 20, 21                           | Matches integer values of 22 or greater      |
| length(value)           | {name:length(7)}     | hamed, fathi, 12345                  | Matches string values with a length of 7     |
| optional int            | {count:int?}         | 456, -222, 0, null                   | Optionally matches any integer               |
| optional int max(value) | {count:int:max(15)?} | 7, -660, 0, null                     | Optionally matches any integer of 15 or less |

## Query strings

URL's are made up of several parts, like protocol, hostname, path and so on. The query string is the part of the URL that comes `after a question-mark` character. So, in a URL like this:

```html
https://www.google.com/search?q=test&oq=hello
```

Everything after the `?` character is considered the query string. The query strings are separated by `&`. In this case, there are two parameters: One called `q` and one called `oq`. They have the values "test" and "hello". These would be relevant to the page displayed by the URL.

So, `Query string values` pass at the end of the URL, not used during routing.

**Simple type**

Write an action

```cs
// HomeController.cs

public class HomeController : Controller
{
    public IActionResult QueryS1(float a, string b, bool c)
    {
        // ...
    }
}
```

You can send your values to model binding engine via query string as following

```html
GET: http://localhost:PORT/Home/QueryS1?a=1.1&b=hamed&c=true
```

**Complex type**

Create a view model

```cs
public class User
{
    public long Id { get; set; }
    public string Name { get; set; }
    public DateTime BirthDate { get; set; }
}
```

Pass it to your action

```cs
// HomeController.cs

public class HomeController : Controller
{
    public IActionResult QueryS2(User user)
    {
        // ...
    }
}
```

Call it by query strings

```cs
GET: http://localhost:PORT/Home/QueryS2?id=1&name=hamed&birthdate=1980-09-10
```

**Collections**

Suppose the parameter to be bound is an array named `selectedCourses`:

```cs
public IActionResult OnPost(int? id, int[] selectedCourses)
```

Query string data can be in one of the following formats:

```html
selectedCourses=1050&selectedCourses=2000 

selectedCourses[0]=1050&selectedCourses[1]=2000

[0]=1050&[1]=2000

selectedCourses[a]=1050&selectedCourses[b]=2000&selectedCourses.index=a&selectedCourses.index=b

[a]=1050&[b]=2000&index=a&index=b
```

**Dictionaries**

Suppose the target parameter is a `Dictionary<int, string>` named `selectedCourses`:

```cs
public IActionResult OnPost(int? id, Dictionary<int, string> selectedCourses)
```

Query string data can look like one of the following examples:

```html
selectedCourses[1050]=Chemistry&selectedCourses[2000]=Economics

[1050]=Chemistry&selectedCourses[2000]=Economics

selectedCourses[0].Key=1050&selectedCourses[0].Value=Chemistry&
selectedCourses[1].Key=2000&selectedCourses[1].Value=Economics

[0].Key=1050&[0].Value=Chemistry&[1].Key=2000&[1].Value=Economics
```

## Uploaded files

ASP.NET Core supports uploading files by exposing the `IFormFile` interface. You can use this interface as a method parameter to your action method and it will be populated with the details of the file upload:

```cs
public IActionResult UploadFile(IFormFile file) {}
```

You can also use an `IEnumerable<IFormFile>` if your action method accepts multiple files:

```cs
public IActionResult UploadFiles(IEnumerable<IFormFile> files) {}
```

The `IFormFile` object exposes several properties and utility methods for reading the contents of the uploaded file:

```cs
public interface IFormFile
{
    string ContentType { get; }
    string ContentDisposition { get; }
    IHeaderDictionary Headers { get; }
    long Length { get; }
    string Name { get; }
    string FileName { get; }
    Stream OpenReadStream();
    void CopyTo(Stream target);
    Task CopyToAsync(Stream target, CancellationToken cancellationToken = null);
}
```

Now, Create a file input control

```html
<form method="post" enctype="multipart/form-data" asp-controller="FileUpload" asp-action="Index">
    <div class="form-group">
        <div class="col-md-10">
            <p>Upload one or more files using this form:</p>
            <input type="file" name="files" multiple />
        </div>
    </div>
    <div class="form-group">
        <div class="col-md-10">
            <input type="submit" value="Upload" />
        </div>
    </div>
</form>
```

When uploading files using model binding and the `IFormFile` interface, the action method can accept either a single `IFormFile` or an `IEnumerable<IFormFile>` representing multiple files. We can loop through one or more uploaded files, save them to the local file system and then use the files as per our application’s logic:

```cs
public class FileUploadController : Controller
{
    [HttpPost("FileUpload")]
    public async Task<IActionResult> Index(List<IFormFile> files)
    {
        long size = files.Sum(f => f.Length);
                        
        var filePaths = new List<string>();
        foreach (var formFile in files)
        {
            if (formFile.Length > 0)
            {
                // full path to file in temp location
                var filePath = Path.GetTempFileName(); //we are using Temp file name just for the example. Add your own file path.
                filePaths.Add(filePath);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await formFile.CopyToAsync(stream);
                }
            }
        }

        // process uploaded files
        // Don't rely on or trust the FileName property without validation.
        return Ok(new { count = files.Count, size, filePaths });
    }
}
```

## A Specific binding source

By default the ASP.NET Core model binder will attempt to bind all action method parameters from different binding sources.

Occasionally, you may find it necessary to specifically declare which binding source to bind to, but in other cases, these sources won't be sufficient. The most common scenarios are when you want to bind a method parameter to a request header value, or when the body of a request contains JSON-formatted data that you want to bind to a parameter. In these cases, you can decorate your action method parameters (or binding model class properties) with attributes that say where to bind from, as shown here

```cs
// GET: http://localhost:PORT/User/GetUserInfo/hamed?age=32

public class UserController
{
    [Route("{controller}/{action}/{name}")]
    public IActionResult GetUserInfo(

    // This will be bound from an HTTP header in the request.
    [FromHeader] string userId,

    // This will be bound from the route. '{name}'
    [FromRoute] string name,

    // This will be bound from the query string. 'age=32'
    [FromQuery] age,

    // The list of photos will be bound to the body of the request, typically in JSON format.
    [FromBody] List<Photo> photos,

    // This will be bound from the DI container.
    [FromServices] ILogger<UserController> logger

    )
    {
        /* method implementation */
    }
}
```

## Prefix

Consider the following model

```cs
public class Instructor
{
    public int Id { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
}
```

**Parameter name**

If the model to be bound is a `parameter` named `instructorToUpdate`:

```cs
public IActionResult OnPost(int? id, Instructor instructorToUpdate)
```

Model binding starts by looking through the sources for the key `instructorToUpdate.Id`. If that isn't found, it looks for `Id` without a prefix.

**Property name**

If the model to be bound is a `property` named `Instructor` of the `controller` or `PageModel` class:

```cs
[BindProperty]
public Instructor Instructor { get; set; }
```

Model binding starts by looking through the sources for the key `Instructor.Id`. If that isn't found, it looks for `Id` without a prefix.

**Custom prefix**

If the model to be bound is a parameter named `instructorToUpdate` and a `Bind` attribute specifies Instructor as the prefix:

```cs
// http://localhost:PORT/Home/Query?id=1&instructor.id=2&instructor.firstname=hamed&instructor.lastname=fathi

public IActionResult OnPost(int? id, [Bind(Prefix = "Instructor")] Instructor instructorToUpdate)
```

## Targets

Model binding tries to find values for the following kinds of targets:

* Parameters of the controller action method that a request is routed to.
* Parameters of the Razor Pages handler method that a request is routed to.
* Public properties of a controller or PageModel class, if specified by attributes.

**[BindProperty] attribute**

Can be applied to a public property of a `controller` or `PageModel` class to cause model binding to target that property:

```cs
public class EditModel : InstructorsPageModel
{
    [BindProperty]
    public Instructor Instructor { get; set; }
```

**[BindProperties] attribute**

Can be applied to a `controller` or `PageModel` class to tell model binding to target all public properties of the class:

```cs
[BindProperties(SupportsGet = true)]
public class CreateModel : InstructorsPageModel
{
    public Instructor Instructor { get; set; }
```

## Attributes for complex type targets

Several built-in attributes are available for controlling model binding of complex types:

**[Bind] attribute**

Can be applied to a class or a method parameter. Specifies which properties of a model should be included in model binding. [Bind] does **not** affect input formatters.

In the following example, only the specified properties of the `Instructor` model are bound when any handler or action method is called:

```cs
[Bind("LastName,FirstMidName,HireDate")]
public class Instructor
```

In the following example, only the specified properties of the `Instructor` model are bound when the `OnPost` method is called:

```cs
[HttpPost]
public IActionResult OnPost([Bind("LastName,FirstMidName,HireDate")] Instructor instructor)
```

**[BindRequired] attribute**

Can only be applied to model properties, not to method parameters. Causes model binding to add a model state error if binding cannot occur for a model's property. Here's an example:

```cs
public class InstructorWithCollection
{
    public int ID { get; set; }

    [DataType(DataType.Date)]
    [DisplayFormat(DataFormatString = "{0:yyyy-MM-dd}", ApplyFormatInEditMode = true)]
    [Display(Name = "Hire Date")]
    [BindRequired] // HERE
    public DateTime HireDate { get; set; }
```

**[BindNever] attribute**

Can only be applied to model properties, not to method parameters. Prevents model binding from setting a model's property. Here's an example:

```cs
public class InstructorWithDictionary
{
    [BindNever] // HERE
    public int ID { get; set; }
```

## Custom Model Binding

Model binding allows controller actions to work directly with model types (passed in as method arguments), rather than HTTP requests. Mapping between incoming request data and application models is handled by model binders. Developers can extend the built-in model binding functionality by implementing custom model binders (though typically, you don't need to write your own provider).

**[ModelBinder]**

In this section we'll implement a custom model binder that:

* Converts incoming request data into strongly typed key arguments.
* Uses Entity Framework Core to fetch the associated entity.
* Passes the associated entity as an argument to the action method.

The following sample uses the `ModelBinder` attribute on the `Author` model:

```cs
using CustomModelBindingSample.Binders;
using Microsoft.AspNetCore.Mvc;

namespace CustomModelBindingSample.Data
{
    // Applying ModelBinder Attribute on Model
    [ModelBinder(BinderType = typeof(AuthorEntityBinder))]
    public class Author
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string GitHub { get; set; }
        public string Twitter { get; set; }
        public string BlogUrl { get; set; }
    }
}
```

In the preceding code, the `ModelBinder` attribute specifies the type of `IModelBinder` that should be used to bind `Author` action parameters.

The following `AuthorEntityBinder` class binds an `Author` parameter by fetching the entity from a data source using Entity Framework Core and an `authorId`:

```cs
public class AuthorEntityBinder : IModelBinder
{
    private readonly AuthorContext _context;

    public AuthorEntityBinder(AuthorContext context)
    {
        _context = context;
    }

    public Task BindModelAsync(ModelBindingContext bindingContext)
    {
        if (bindingContext == null)
        {
            throw new ArgumentNullException(nameof(bindingContext));
        }

        var modelName = bindingContext.ModelName;

        // Try to fetch the value of the argument by name
        var valueProviderResult = bindingContext.ValueProvider.GetValue(modelName);

        if (valueProviderResult == ValueProviderResult.None)
        {
            return Task.CompletedTask;
        }

        bindingContext.ModelState.SetModelValue(modelName, valueProviderResult);

        var value = valueProviderResult.FirstValue;

        // Check if the argument value is null or empty
        if (string.IsNullOrEmpty(value))
        {
            return Task.CompletedTask;
        }

        if (!int.TryParse(value, out var id))
        {
            // Non-integer arguments result in model state errors
            bindingContext.ModelState.TryAddModelError(
                modelName, "Author Id must be an integer.");

            return Task.CompletedTask;
        }

        // Model will be null if not found, including for
        // out of range id values (0, -3, etc.)
        var model = _context.Authors.Find(id);
        bindingContext.Result = ModelBindingResult.Success(model);
        return Task.CompletedTask;
    }
}
```

The following code shows how to use the `AuthorEntityBinder` in an action method:

```cs
[HttpGet("get/{authorId}")]
public IActionResult Get(Author author)
{
    if (author == null)
    {
        return NotFound();
    }

    return Ok(author);
}
```

The `ModelBinder` attribute can be used to apply the `AuthorEntityBinder` to parameters that don't use default conventions:

```cs
// Applying ModelBinding Attribute on Action method
[HttpGet("{id}")]
public IActionResult GetById([ModelBinder(Name = "id")] Author author)
{
    if (author == null)
    {
        return NotFound();
    }

    return Ok(author);
}
```

In this example, since the name of the argument isn't the default `authorId`, it's specified on the parameter using the `ModelBinder` attribute. Both the controller and action method are simplified compared to looking up the entity in the action method. The logic to fetch the author using Entity Framework Core is moved to the model binder. This can be a considerable simplification when you have several methods that bind to the `Author` model.

You can apply the `ModelBinder` attribute to individual model properties (such as on a viewmodel) or to action method parameters to specify a certain model binder or model name for just that type or action.

**Implementing a ModelBinderProvider**

Instead of applying an attribute, you can implement `IModelBinderProvider`. This is how the built-in framework binders are implemented. When you specify the type your binder operates on, you specify the type of argument it produces, **not** the input your binder accepts. The following binder provider works with the `AuthorEntityBinder`. When it's added to MVC's collection of providers, you don't need to use the `ModelBinder` attribute on `Author` or `Author`-typed parameters.

```cs
using CustomModelBindingSample.Data;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.ModelBinding.Binders;
using System;

namespace CustomModelBindingSample.Binders
{
    public class AuthorEntityBinderProvider : IModelBinderProvider
    {
        public IModelBinder GetBinder(ModelBinderProviderContext context)
        {
            if (context == null)
            {
                throw new ArgumentNullException(nameof(context));
            }

            if (context.Metadata.ModelType == typeof(Author))
            {
                return new BinderTypeModelBinder(typeof(AuthorEntityBinder));
            }

            return null;
        }
    }
}
```

To use a custom model binder provider, add it in `ConfigureServices`:

```cs
public void ConfigureServices(IServiceCollection services)
{
    services.AddDbContext<AuthorContext>(options => options.UseInMemoryDatabase("Authors"));

    services.AddControllers(options =>
    {
        options.ModelBinderProviders.Insert(0, new AuthorEntityBinderProvider());
    });
}
```

When evaluating model binders, the collection of providers is examined in order. The first provider that returns a binder that matches the input model is used. Adding your provider to the end of the collection may thus result in a built-in model binder being called before your custom binder has a chance. In this example, the custom provider is added to the beginning of the collection to ensure it's always used for `Author` action arguments.

## Validation

Data can come from many different sources in your web application—you could load it from files, read it from a database, or you could accept values that a user typed into a form in requests. Although you might be inclined to trust that the data already on your server is valid (though this is sometimes a dangerous assumption!), you definitely shouldn't trust the data sent as part of a request.

**DataAnnotations**

Validation attributes, or more precisely `DataAnnotations` attributes, allow you to specify rules that the properties in your model should conform to. They provide metadata about your model by describing the sort of data the model should contain, as opposed to the data itself.

```cs
Public class UserBindingModel
{
    [Required]
    [StringLength(100)]
    [Display(Name = "Your name")]
    public string FirstName { get; set; }

    [Required]
    [StringLength(100)]
    [Display(Name = "Last name")]
    public string LastName { get; set; }

    [Required]
    [EmailAddress]
    public string Email { get; set; }

    [Phone]
    [Display(Name = "Phone number")]
    public string PhoneNumber { get; set; }
}
```

Some of these attributes are:

| Attribute                  | Description                                                                                             |
|----------------------------|---------------------------------------------------------------------------------------------------------|
| [CreditCard]               | Validates that a property has a valid credit card format.                                               |
| [EmailAddress]             | Validates that a property has a valid email address format.                                             |
| [StringLength(max)]        | Validates that a string has at most the max amount of characters.                                       |
| [MinLength(min)]           | Validates that a collection has at least the min amount of items.                                       |
| [Phone]                    | Validates that a property has a valid phone number format.                                         |                                      
| [Range(min, max)]          | Validates that a property has a value between min and max.                                              |
| [RegularExpression(regex)] | Validates that a property conforms to the regex regular expression pattern                              |
| [Url]                      | Validates that a property has a valid URL format                                                        |
| [Required]                 | Indicates the property that must be provided                                                            |
| [Compare]                  | Allows you to confirm that two properties have the same value (for example, `Email` and `ConfirmEmail`) |
| [DataType(enum)]           | This attribute is used to specify the datatype of the model - `CreditCard`, `Currency`, `Custom`, `Date`, `DateTime`, `Duration`, `EmailAddress`, `Html`, `ImageUrl`, `MultilineText`, `Password`, `PhoneNumber`, `PostalCode`, `Text`, `Time`, `Upload`, `Url` |


**Custom DataAnnotations**

Imagine we want to restrict the address field value of a student to limited number of words. For example we might say 50 words is more than enough for an address field. You might also think that this type of validation (limiting a string to a maximum number of words) 

```cs
using System.ComponentModel.DataAnnotations;

public class MaxWordAttributes : ValidationAttribute
{
    private readonly int _maxWords;
    public MaxWordAttributes(int maxWords)
        : base("{0} has to many words.")
    {
        _maxWords = maxWords;
    }
    protected override ValidationResult IsValid(object value, ValidationContext validationContext)
    {
        if (value == null) return ValidationResult.Success;
        var textValue = value.ToString();
        if (textValue.Split(' ').Length <= _maxWords) return ValidationResult.Success;
        var errorMessage = FormatErrorMessage((validationContext.DisplayName));
        return new ValidationResult(errorMessage);
    }
}
```

And use it 

```cs
[DataType(DataType.MultilineText)]  
[MaxWordAttributes(50, ErrorMessage="There are too many words in {0}.")]  
public string Address { get; set; }  
```

**Validating on the server**

Validation of the binding model occurs before the action executes, but note that the action always executes, whether the validation failed or succeeded. It's the responsibility of the action method to handle the result of the validation

The `ModelState` is a property of a `Controller` and represents a collection of name and value pairs that were submitted to the server during a `POST`. It also contains a collection of error messages for each value submitted, this object is a `ModelStateDictionary`. Despite its name, it doesn't actually know anything about any model classes, it only has names, values, and errors.

ModelState has two purposes: to store the value submitted to the server, and to store the validation errors associated with those values.

```cs
if (!ModelState.IsValid)
{
    // Do something about it!
    // Usually return the user to the same page
    // while showing the errors.
}
```

We have the `AddUserVM` view model:

```cs
public class AddUserVM
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string EmailAddress { get; set; }
}
```

Also, we have the actions:

```cs
// Controllers/HomeController.cs

[HttpPost]
public ActionResult Add(AddUserVM model)
{
    if(!ModelState.IsValid)
    {
        return View(model);
    }
    return RedirectToAction("Index");
}
```

**Custom Validation**

But what if we needed to perform more complex validation than what is provided by attributes? Say we needed to validate that the first and last names are not identical, and display a particular error message when this happens.

We can actually add errors to the model state via the `AddModelError` method on `ModelStateDictionary`:

```cs
[HttpPost]
public ActionResult Add(AddUserVM model)
{
    if(model.FirstName == model.LastName)
    {
        // HERE
        ModelState.AddModelError("LastName", "The last name cannot be the same as the first name.");
    }
    if(!ModelState.IsValid)
    {
        return View(model);
    }
    return RedirectToAction("Index");
}
```

## Reference(s)

Most of the information in this article has gathered from various references.

* https://docs.microsoft.com/en-us/aspnet/core/mvc/models/model-binding
* https://docs.microsoft.com/en-us/aspnet/core/mvc/advanced/custom-model-binding
* https://www.tektutorialshub.com/asp-net-core/asp-net-core-model-binding/
* https://wakeupandcode.com/forms-and-fields-in-asp-net-core/
* https://www.manning.com/books/asp-net-core-in-action
* https://code-maze.com/file-upload-aspnetcore-mvc/
* https://medium.com/better-programming/the-anatomy-of-an-http-request-728a469ecba9
* https://blog.zhaytam.com/2019/04/13/asp-net-core-checking-modelstate-isvalid-is-boring/
* https://exceptionnotfound.net/asp-net-mvc-demystified-modelstate
* https://www.c-sharpcorner.com/article/custom-data-annotation-validation-in-mvc/