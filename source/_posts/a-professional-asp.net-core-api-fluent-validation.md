---
title: A Professional ASP.NET Core API - FluentValidation
date: September 29 2020
category: aspnetcore-api
tags:
    - dotnet
    - aspnetcore
    - webapi
    - validation
    - fluentvalidation
---
 
`FluentValidation` is a A .NET library for building strongly-typed validation rules. It uses lambda expressions for building validation rules for your business objects. 

If you want to do simple validation in asp.net mvc application then data annotations validation is good but in case if you want to implement complex validation then you need to use `FluentValidation`.

In the following we will see how it can be added to a project and how it works.

<!-- more -->

Install the below packages

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
        // HERE
        .AddFluentValidation()
        ;
}                
```

In order for ASP.NET to discover your validators, they must be registered with the services collection. You can either do this by calling the `AddTransient` method for each of your validators:

```cs
public void ConfigureServices(IServiceCollection services)
{
    services
        .AddControllers()
        // HERE
        .AddFluentValidation()
        ;

    services.AddTransient<IValidator<Person>, PersonValidator>(); 
}                
```

**Using the validator in a controller**

```cs
public class Person {
	public int Id { get; set; }
	public string Name { get; set; }
	public string Email { get; set; }
	public int Age { get; set; }
}

public class PersonValidator : AbstractValidator<Person> {
	public PersonValidator() {
		RuleFor(x => x.Id).NotNull();
		RuleFor(x => x.Name).Length(6, 16);
		RuleFor(x => x.Email).EmailAddress();
		RuleFor(x => x.Age).InclusiveBetween(18, 60);
	}
}
```

We can use the Person class within our controller and associated view:

```cs
[ApiController]
[Route("[controller]")]
public class WeatherForecastController : ControllerBase
{
    /*
        {
          "id": 1,
          "name": "hamed",
          "email": "hamedfathi@outlook.com",
          "age": 32
        }
    */
    [HttpPost]
    public IActionResult Create(Person person)
    {
        if (ModelState.IsValid)
        {
            return Ok();
        }
        else
        {
            return NotFound();
        }
    }
}
```

Now, If you call the `Create` API with above `JSON` data you will see the below result

```json
{
    "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
    "title": "One or more validation errors occurred.",
    "status": 400,
    "traceId": "|4e6b48f8-4d5461460c3f9b04.",
    "errors": {
        "Name": [
            "'Name' must be between 6 and 16 characters. You entered 5 characters."
        ]
    }
}
```

## Automatic Registration

You can also use the below methods to automatically register all validators within a particular assembly. This will automatically find any public, non-abstract types that inherit from `AbstractValidator` and register them with the container (open generics are not supported).

```cs
public void ConfigureServices(IServiceCollection services)
{
    services
        .AddControllers()
        .AddFluentValidation(options =>
        {            
            // HERE
            options.RegisterValidatorsFromAssembly(Assembly.GetExecutingAssembly());
            // OR
            options.RegisterValidatorsFromAssemblyContaining<Startup>();
            // OR
            options.RegisterValidatorsFromAssemblyContaining<PersonValidator>();
            // OR
            options.RegisterValidatorsFromAssemblyContaining<PersonValidator>(lifetime:ServiceLifetime.Singleton);
            // OR
            options.RegisterValidatorsFromAssemblyContaining<PersonValidator>(discoveredType => discoveredType.ValidatorType != typeof(SomeValidatorToExclude));
        });
}                
```

## Compatibility with ASP.NET's built-in Validation

By default, after `FluentValidation` is executed, any other validator providers will also have a chance to execute. This means you can mix `FluentValidation` with `DataAnnotations` attributes (or any other ASP.NET `ModelValidatorProvider` implementation).

If you want to disable this behaviour so that `FluentValidation` is the only validation library that executes, you can set the `RunDefaultMvcValidationAfterFluentValidationExecutes` to `false` in your application startup routine:

```cs
public void ConfigureServices(IServiceCollection services)
{
    services
        .AddControllers()
        .AddFluentValidation(options =>
        {            
            // HERE
            options.RunDefaultMvcValidationAfterFluentValidationExecutes = false;
        });
}    
```

## Built-in Validators

* `NotNull ("NotNull")`: to check the property is null.
* `NotEmpty ("NotEmpty")`: to check the property is null, empty or has whitespace.
* `NotEqual ("NotEqual")`: to check the specified property is not equal to a particular value.
* `Equal Validator ("Equal")`: to check the value of the specified property is equal to a particular value.
* `Length Validator ("Length")`: to check the length of a particular string property is within the specified range.
* `MaxLength Validator ("MaximumLength")`: to check the length of a particular string property is no longer than the * specified value.
* `MinLength Validator ("MinimumLength")`: to check the length of a particular string property is longer than the * specified value.
* `Less Than Validator ("LessThan")`: to check the length of the specified property is less than a particular value
* `LessThanOrEqual Validator ("LessThanOrEqualTo")`: to check the value of the specified property is less than or * equal to a particular value.
* `Greater Than Validator ("GreaterThan")`: to check the value of the specified property is greater than a particular * value.
* `Regular Expression Validator ("Matches")`: to check the value of the specified property matches the given regular * expression.
* `Email Validator Validator ("EmailAddress")`: to check the value of the specified property is a valid email address.

## Implicit vs Explicit Child Property Validation

When validating complex object graphs, by default, you must explicitly specify any child validators for complex properties by using `SetValidator`.

When running an ASP.NET MVC application, you can also optionally enable implicit validation for child properties. When this is enabled, instead of having to specify child validators using `SetValidator`, MVC’s validation infrastructure will recursively attempt to automatically find validators for each property. This can be done by setting `ImplicitlyValidateChildProperties` to true:

```cs
public void ConfigureServices(IServiceCollection services)
{
    services
        .AddControllers()
        .AddFluentValidation(options =>
        {            
            // HERE
            options.ImplicitlyValidateChildProperties  = true;
        });
}    
```

## Manual validation

Sometimes you may want to manually validate an object in a MVC project. In this case, the validation results can be copied to MVC’s modelstate dictionary:

```cs
[HttpPost]
public async Task<IActionResult> Create()
{
    TesterValidator validator = new TesterValidator();
    List<string> ValidationMessages = new List<string>();
    var tester = new Tester
    {
        FirstName = "",
        Email = "bla!"
    };
    var validationResult = validator.Validate(tester);
    var response = new ResponseModel();
    if (!validationResult.IsValid)
    {
        response.IsValid = false;
        foreach (ValidationFailure failure in validationResult.Errors)
        {
            ValidationMessages.Add(failure.ErrorMessage);
        }
        response.ValidationMessages = ValidationMessages;
    }
    return Ok(response);
}
```

## Custom messages

We can extend the above example to include a more useful error message. At the moment, our custom validator always returns the message “The list contains too many items” if validation fails. Instead, let’s change the message so it returns “’Pets’ must contain fewer than 10 items.” This can be done by using custom message placeholders. FluentValidation supports several message placeholders by default including {PropertyName} and {PropertyValue} ([see this list for more](https://docs.fluentvalidation.net/en/latest/built-in-validators.html)), but we can also add our own.

```cs
public class PersonValidator : AbstractValidator<Person> {
	public PersonValidator() {
		RuleFor(x => x.Id).NotNull().WithMessage("{PropertyName} should be not null. NEVER!");;
		RuleFor(x => x.Name).Length(6, 16);
		RuleFor(x => x.Email).EmailAddress();
		RuleFor(x => x.Age).InclusiveBetween(18, 60);
	}
}
```

## Localization

You can add `IStringLocalizer<T>` to the `ctor` of a validator

```cs
public class PersonValidator : AbstractValidator<Person>
{
    public PersonValidator(IStringLocalizer<Person> localizer /*HERE*/)
    {
        RuleFor(e => e.Name).MinimumLength(5)
            .WithMessage(e => string.Format(localizer[Name], nameof(e.Name) /* {0} placeholder */ ));
        RuleFor(e => e.FamilyName).MinimumLength(5)
            .WithMessage(e => string.Format(localizer[Name], nameof(e.Name) /* {0} placeholder */ ));
        RuleFor(e => e.Address).MinimumLength(10)
            .WithMessage(e => localizer[Address]);
        RuleFor(e => e.EmailAddress).EmailAddress()
            .WithMessage(e => localizer[EmailAddress]);           
        RuleFor(e => e.Age).InclusiveBetween(20, 60)
            .WithMessage(e => localizer[Age]);
    }
}
```

And these are our resources

```json
// person.en-US.json
{
  "Name": "'{0}' must be at least 5 characters length.",
  "Address": "'Address' must be at least 10 characters length.",
  "EmailAddress": "'EmailAddress' is not valid.",
  "Age": "'Age' must be between 20 and 60.",
}

// person.de.json
{
  "Name": "'{0}' muss mindestens 5 Zeichen lang sein.",
  "Address": "'Address' muss mindestens 10 Zeichen lang sein.",
  "EmailAddress": "'EmailAddress' ist ungültig.",
  "Age": "'Age' muss zwischen 20 und 60 liegen.",
}

// person.fa-IR.json
{
  "Country": "کشور وارد شده معتبر نیست.",
  "Name": "{0} نباید کمتر از 5 کاراکتر باشد.",
  "Address": "آدرس نباید کمتر از 10 کاراکتر باشد.",
  "EmailAddress": "ایمیل وارد شده معتبر نیست.",
  "Age": "سن باید بین 20 تا 60 باشد.",
}
```

## Swagger integration

Use `FluentValidation` rules instead of `ComponentModel` attributes to define swagger schema.

Install below package

```cs
Install-Package MicroElements.Swashbuckle.FluentValidation -Version 4.0.0
dotnet add package MicroElements.Swashbuckle.FluentValidation --version 4.0.0
<PackageReference Include="MicroElements.Swashbuckle.FluentValidation" Version="4.0.0" />
```

Change `Startup.cs` as following

```cs
// Startup.cs

public void ConfigureServices(IServiceCollection services)
{
    // HttpContextServiceProviderValidatorFactory requires access to HttpContext
    services.AddHttpContextAccessor();

    services
        .AddControllers()
        // Adds fluent validators to Asp.net
        .AddFluentValidation(c =>
        {
            c.RegisterValidatorsFromAssemblyContaining<Startup>();
            //HERE
            // Optionally set validator factory if you have problems with scope resolve inside validators.
            c.ValidatorFactoryType = typeof(HttpContextServiceProviderValidatorFactory);
        })

    services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new OpenApiInfo { Title = "My API", Version = "v1" });

        // HERE
        // Adds fluent validation rules to swagger        
        c.AddFluentValidationRules();
    });

    // Adds logging
    services.AddLogging(builder => builder.AddConsole());
}

// This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
public void Configure(IApplicationBuilder app, IHostingEnvironment env)
{
    app.UseRouting();

    app.UseEndpoints(endpoints =>
    {
        endpoints.MapControllers();
    });

    // Adds swagger
    app.UseSwagger();

    // Adds swagger UI
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "My API V1");
    });
}
```

**Extensibility**

You can register `FluentValidationRule` in `ServiceCollection`.

User defined rule name replaces default rule with the same. Full list of default rules can be get by `FluentValidationRules.CreateDefaultRules()`

List or default rules:

* Required
* NotEmpty
* Length
* Pattern
* Comparison
* Between
* 
Example of rule:

```cs
new FluentValidationRule("Pattern")
{
    Matches = propertyValidator => propertyValidator is IRegularExpressionValidator,
    Apply = context =>
    {
        var regularExpressionValidator = (IRegularExpressionValidator)context.PropertyValidator;
        context.Schema.Properties[context.PropertyKey].Pattern = regularExpressionValidator.Expression;
    }
},
```

## Reference(s)

Most of the information in this article has gathered from various references.

* https://docs.fluentvalidation.net/en/latest/index.html
* https://www.codewithmukesh.com/blog/fluent-validation-aspnet-core/
* https://github.com/micro-elements/MicroElements.Swashbuckle.FluentValidation