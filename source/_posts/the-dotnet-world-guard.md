---
title: The .NET World - Guard
date: October 2 2020
category: dotnet
tags:
    - dotnet
    - guard
---
 
I want to introduce a high-performance, extensible argument validation library.

`Guard` is a fluent argument validation library that is intuitive, fast and extensible. `Guard` takes advantage of almost all the new features introduced in `C# 7.2`.

<!-- more -->

Install the below package

```bash
Install-Package Dawn.Guard -Version 1.12.0
dotnet add package Dawn.Guard --version 1.12.0
<PackageReference Include="Dawn.Guard" Version="1.12.0" />
```

## Introduction

Here is a sample constructor that validates its arguments without Guard:

```cs
public Person(string name, int age)
{
    if (name == null)
        throw new ArgumentNullException(nameof(name), "Name cannot be null.");

    if (name.Length == 0)
        throw new ArgumentException("Name cannot be empty.", nameof(name));

    if (age < 0)
        throw new ArgumentOutOfRangeException(nameof(age), age, "Age cannot be negative.");

    Name = name;
    Age = age;
}
```

And this is how we write the same constructor with Guard:

```
using Dawn; // Bring Guard into scope.

public Person(string name, int age)
{
    Name = Guard.Argument(name, nameof(name)).NotNull().NotEmpty();
    Age = Guard.Argument(age, nameof(age)).NotNegative();
}
```

## Standard Validations

Below is a complete list of validations that are included with the library. Optional parameters that
allow you to specify custom exception messages are omitted for brevity.

**Null Guards**

For `ArgumentInfo<T> where T : class` and `ArgumentInfo<T?> where T : struct`
* `Null()`
* `NotNull()` - When called for an argument of `T?`, returns an argument of `T`.

Static without type constraints:
* `NotAllNull(ArgumentInfo<T1>, ArgumentInfo<T2>)`
* `NotAllNull(ArgumentInfo<T1>, ArgumentInfo<T2>, ArgumentInfo<T3>)`

**Equality Guards**

For `ArgumentInfo<T>`
* `Equal(T)`
* `Equal(T, IEqualityComparer<T>)`
* `NotEqual(T)`
* `NotEqual(T, IEqualityComparer<T>)`

For `ArgumentInfo<T> where T : class`
* `Same(T)`
* `NotSame(T)`

For `ArgumentInfo<T|T?> where T : struct`
* `Default()`
* `NotDefault()`

**Comparison Guards**

For `ArgumentInfo<T> where T : IComparable<T>`
* `Min(T)`
* `Max(T)`
* `GreaterThan(T)`
* `LessThan(T)`
* `InRange(T, T)`

For `ArgumentInfo<T|T?> where T : struct, IComparable<T>`
* `Zero()`
* `NotZero()`
* `Positive()`
* `NotPositive()`
* `Negative()`
* `NotNegative()`

**Boolean Guards**

For `ArgumentInfo<bool|bool?>`
* `True()`
* `False()`

**Collection Guards**

For `ArgumentInfo<T> where T : IEnumerable`
* `Empty()`
* `NotEmpty()`
* `Count(int)`
* `NotCount(int)`
* `MinCount(int)`
* `MaxCount(int)`
* `CountInRange(int, int)`
* `Contains<TItem>(TItem)`
* `Contains<TItem>(TItem, IEqualityComparer<TItem>)`
* `DoesNotContain<TItem>(TItem)`
* `DoesNotContain<TItem>(TItem, IEqualityComparer<TItem>)`
* `ContainsNull()`
* `DoesNotContainNull()`
* `DoesNotContainDuplicate()`
* `DoesNotContainDuplicate(IEqualityComparer<TItem>)`

For `ArgumentInfo<T>`
* `In<TCollection>(TCollection)`
* `In<TCollection>(TCollection, IEqualityComparer<T>)`
* `NotIn<TCollection>(TCollection)`
* `NotIn<TCollection>(TCollection, IEqualityComparer<T>)`

**String Guards**

For `ArgumentInfo<string>`
* `Empty()`
* `NotEmpty()`
* `WhiteSpace()`
* `NotWhiteSpace()`
* `Length(int)`
* `NotLength(int)`
* `MinLength(int)`
* `MaxLength(int)`
* `LengthInRange(int, int)`
* `Equal(string, StringComparison)`
* `NotEqual(string, StringComparison)`
* `StartsWith(string)`
* `StartsWith(string, StringComparison)`
* `DoesNotStartWith(string)`
* `DoesNotStartWith(string, StringComparison)`
* `EndsWith(string)`
* `EndsWith(string, StringComparison)`
* `DoesNotEndWith(string)`
* `DoesNotEndWith(string, StringComparison)`
* `Matches(string)`
* `Matches(string, TimeSpan)`
* `Matches(Regex)`
* `DoesNotMatch(string)`
* `DoesNotMatch(string, TimeSpan)`
* `DoesNotMatch(Regex)`

**Time Guards**

For `ArgumentInfo<DateTime|DateTime?>`

* `KindSpecified()`
* `KindUnspecified()`

**Floating-Point Number Guards**

For `ArgumentInfo<float|float?|double|double?>`
* `NaN()`
* `NotNaN()`
* `Infinity()`
* `NotInfinity()`
* `PositiveInfinity()`
* `NotPositiveInfinity()`
* `NegativeInfinity()`
* `NotNegativeInfinity()`
* `Equal(T, T)` - Approx. equality.
* `NotEqual(T, T)` - Approx. unequality.

**URI Guards**

For `ArgumentInfo<Uri>`
* `Absolute`
* `Relative`
* `Scheme(string)`
* `NotScheme(string)`
* `Http()`
* `Http(bool)`
* `Https()`

**Enum Guards**
For `ArgumentInfo<T|T?> where T : struct, Enum`
* `Defined()`
* `HasFlag(T)`
* `DoesNotHaveFlag(T)`

**Email Guards**
For `ArgumentInfo<MailAddress>`
* `HasHost(string)`
* `DoesNotHaveHost(string)`
* `HostIn(IEnumerable<string>)`
* `HostNotIn(IEnumerable<string>)`
* `HasDisplayName()`
* `DoesNotHaveDisplayName()`

**Type Guards**

For `ArgumentInfo<T>`
* `Compatible<TTarget>()`
* `NotCompatible<TTarget>()`
* `Cast<TTarget>` - Returns an argument of `TTarget`

For `ArgumentInfo<object>`
* `Type<T>()` - Returns an argument of `T`.
* `NotType<T>()`
* `Type(Type)`
* `NotType(Type)`

**Member Guards**
For `ArgumentInfo<T>`
* `Member<TMember>(Expression<Func<T, TMember>>, Action<ArgumentInfo<TMember>>)`
* `Member<TMember>(Expression<Func<T, TMember>>, Action<ArgumentInfo<TMember>>, bool)`

**Normalization Guards**

For `ArgumentInfo<T>`
* `Modify<TTarget>(TTarget value)` - Returns an argument of `TTarget`
* `Modify<TTarget>(Func<T, TTarget>)` - Returns an argument of `TTarget`
* `Wrap<TTarget>(Func<T, TTarget>)` - Returns an argument of `TTarget`

For `ArgumentInfo<T> where T : class, ICloneable`
* `Clone()`

**Predicate Guards**

For `ArgumentInfo<T>`
* `Require(bool)`
* `Require<TException>(bool)`
* `Require(Func<T, bool>)`
* `Require<TException>(Func<T, bool>)`

**State Guards**

For validating instance states instead of method arguments:
* `Operation(bool)` - Throws `InvalidOperationException` for `false`
* `Support(bool)` - Throws `NotSupportedException` for `false`
* `Disposal(bool, string)` - Throws `ObjectDisposedException` for `true`

## Initializing a Guarded Argument

Guard needs to know the argument's value to test it against preconditions and its name to include in
a potential exception. There are three ways to initialize a guarded argument:

```cs
// First, by specifying the argument value and name separately.
Guard.Argument(arg, nameof(arg));

// Second, omitting the optional argument name.
Guard.Argument(arg);

// Third, creating a MemberExpression via a lambda expression.
Guard.Argument(() => arg);
```

* The first sample initializes a guarded argument by specifying both the argument's value and name.
* The second sample does not specify the argument name. This is allowed but not recommended since
the argument name proves a valuable piece of information when you try to identify the error cause
from logs or crash dumps.
* The third sample initializes a `MemberExpression` that provides both the argument's value and
  name. Although compiling an expression tree is an expensive operation, it is a convenient
  alternative that can be used in applications that are not performance-critical.

## Exception Types

Each validation in Guard has a specific exception type it throws when its precondition is not
satisfied. `NotNull` throws an `ArgumentNullException`. The validations on `IComparable<T>`
arguments like `MinValue` and `NotZero` throw `ArgumentOutOfRangeException`s. Most others
throw `ArgumentException`s. (See Modifying Arguments for exceptional cases.)

Throwing custom exceptions from standard validations seems counter-intuitive and right now, the only
way to do so is to use the generic `Require<TException>` validation.

```cs
Guard.Argument(() => arg).Require<KeyNotFoundException>(a => a != 0);
```

The above code throws a `KeyNotFoundException` if the `arg` is passed `0`.

## Exception Messages

Guard creates a meaningful exception message that contains the argument name and a description
specific to the validation when a precondition can't be satisfied. Additionaly, every validation in
Guard accepts an optional parameter letting the user specify a custom error message.

```cs
// Throws an ArgumentException if the arg is not null.
Guard.Argument(() => arg).Null(a => "The argument must be null but it is: " + a);

// Throws an ArgumentNullException if the arg is null.
Guard.Argument(() => arg).NotNull("The argument cannot be null.");
```

In the first example above, we specify a factory that will create the error message if the
validation fails. `arg` is passed to the factory as `a` so it can be used in the error message. We
could of course use `arg` directly but that would cause it to be captured by the lambda expression,
thus prevent the expression from being cached. We could make the `Null` validation accept a
`string` parameter instead of a `Func<T, string>`, but that would require the error message to
be initialized even when the precondition is satisfied, i.e. when the argument is null.

In the second example, we see that the `NotNull` validation accepts the error message as a string
instead of a factory. This is because it only throws an exception if the argument value is null.
Therefore the only possible value that can be passed to a factory would be null.

## Secure Arguments

Exceptions thrown for failed Guard validations contain very descriptive messages.

```cs
// Throws with message: "token must be a2C-p."
Guard.Argument("abc", "token").Equal("a2C-p");

// Throws with message: "number must be one of the following: 1, 2, 3"
Guard.Argument(0, "number").In(1, 2, 3);
```

There may be cases where you don't want to expose that additional data to the caller. For these
scenarios, you can specify the optional "secure" flag when you initialize the argument.

```cs
// Throws with message: "token is invalid."
Guard.Argument("abc", "token", true).Equal("a2C-p");

// Throws with message: "number is invalid."
Guard.Argument(0, "number", true).In(1, 2, 3);
```

Things to note:

* Parameter names are never secured.
* Min/Max values of range checks are never secured.
* Type names are never secured.
* Exceptions that are not directly thrown by the library are never secured.

## Modifying Arguments

A method that validates its arguments can also apply some normalization routines before using them.
Trimming a string before assigning it to a field/property is a good example for that. Guard provides
the `Modify` overloads that can be used for normalizing argument values.

```cs
public Person(string name)
{
    Name = Guard.Argument(() => name)
        .NotNull()
        .Modify(s => s.Trim())
        .MinLength(3); // Validates the trimmed version.
}
```

Since the arguments can be modified to have any value, including null, `NotNull` validations
applied to modified arguments shouldn't throw `ArgumentNullException`s.

```cs
public Person GetOwner(Car car)
{
    return Guard.Argument(() => car)
        .NotNull()
        .Modify(c => c.Owner)
        .NotNull();
}
```

The first call to `NotNull` in the above example throws an `ArgumentNullException` if `car` is
null but the second call to `NotNull` should throw an `ArgumentException`. This is because
throwing an `ArgumentNullException` there would indicate that `car` is null when in fact its
`Owner` is null.

The same goes for `ArgumentOutOfRangeException`s. If the original argument is modified, an
`ArgumentException` is thrown instead of a more specialized exception. For validations to detect
whether the argument is modified, `ArgumentInfo<T>` contains a boolean `Modified` flag along
with the argument's name and value.

## Validating Argument Members

Some arguments may contain fields/properties that we want to validate individually. Guard provides
`Member` overloads that can be used to validate these members without modifying the arguments.

```cs
public void BuyCar(Person buyer, Car car)
{
    Guard.Argument(() => buyer)
        .NotNull()
        .Member(p => p.Age, a => a.Min(18))
        .Member(p => p.Address.City, c => c.NotNull().NotEmpty());

    Guard.Argument(() => car)
        .NotNull()
        .Member(c => c.Owner, o => o.Null());

    car.Owner = buyer;
}
```

What makes `Member` overloads powerful is that they provide members as guarded arguments so you can
directly start chaining validations. What's better is when a member validation fails, the exception
is still thrown for the original argument (same `ParamName`) but also with a clear error message
that contains the actual member's name.

```cs
var address = new Address { City = null };
var buyer = new Person { Age = 18, Address = address };
var car = new Car("Dodge", "Power Wagon");
BuyCar(buyer, car);
```

The above code throws an `ArgumentException` with the parameter name "buyer" and message
"Address.City cannot be null.".

Keep in mind that member validations require building `MemberExpression`s. Even though the
compiled delegates get cached and reused, creating expression trees may still be expensive for your
particular application.

## State Guards

Along with its arguments, a method may also need to validate the state of the instance it belongs
to. Guard currently provides three validations to handle these cases:

### Operation

* Throws an `InvalidOperationException` when the first parameter (`valid`) is passed false.
* A custom message can be specified using the second parameter (`message`).
* A third parameter marked with `[CallerMemberName]` exists to retrieve the invoked method's name.

```cs
// Throws an InvalidOperationException with the message:
// "TestOperation call is not valid due to the current state of the object."
Guard.Operation(false);

// Throws an InvalidOperationException with the message:
// "Custom message."
Guard.Operation(false, "Custom message.");
```

### Support

* Throws a `NotSupportedException` when the first parameter (`supported`) is passed false.
* A custom message can be specified using the second parameter (`message`).
* A third parameter marked with `[CallerMemberName]`] exists to retrieve the invoked method's name.

```cs
// Throws a NotSupportedException with the message:
// "TestSupport is not supported"
Guard.Support(false);

// Throws a NotSupportedException with the message:
// "Custom message."
Guard.Support(false, "Custom message.");
```

### Disposal

* Throws an `ObjectDisposedException` when the first parameter (`disposed`) is passed true.
* The object name can be specified using the second parameter (`objectName`).
* A custom message can be specified using the third parameter (`message`).

```cs
// Throws an ObjectDisposedException with the message:
// "Cannot access a disposed object."
Guard.Disposal(true);

// Throws an ObjectDisposedException with the message:
// "Cannot access a disposed object.\r\nObject name: 'TestClass'."
Guard.Disposal(true, nameof(TestClass));

// Throws an ObjectDisposedException with the message:
// "Custom message."
Guard.Disposal(true, nameof(TestClass), "Custom message.");
```

## Guarding Scopes

Scopes can be created to intercept exceptions that are caused by failed validations.

```cs
void Foo()
{
    using (Guard.BeginScope((ex, stackTrace) => _logger.Log(stackTrace)))
    {
        Print(null);
    }
}

void Print(string message)
{
    Guard.Argument(() => message).NotNull();
    Console.WriteLine(message);
}
```

In the above example we create a scope with an exception interceptor that logs the stack traces of
failed validations. When we call `Print` with a null argument, `NotNull` validation fails and an
`ArgumentNullException` is created. This exception is passed to the interceptor right before it is
thrown.

Since the exception hasn't been thrown yet, its `StackTrace` property is null at the point of
interception. This is why the stack trace is passed as a separate argument to the interceptor
delegate.

* Scopes are implemented using `AsyncLocal<T>`, so they are bound to the execution context.
  This makes them available to use on asynchronous code.
* The existence of a scope is checked only when a validation fails, so this has no performance
  overhead for successful validations.
* Scopes can be nested and by default, the exceptions bubble-up to parent scopes. `BeginScope`
  accepts a second, optional parameter that can be used to disable this behavior.
* Scopes do not have to end. You can create one in `Main` and not dispose it to provide an
  application-wide scope; or in the `BeginRequest` of an ASP.NET application to provide a
  request-wide scope.

## Extensibility

This document describes how to add custom validations to Guard by writing simple extension methods.

**A Basic Validation**

Here is a basic extension that throws an `ArgumentException` if a GUID argument is passed
uninitialized. It is not included among the standard validations because the `NotDefault` method
defined for structs covers its functionality.

```cs
public static class GuardExtensions
{
    public static ref readonly Guard.ArgumentInfo<Guid> NotEmpty(
        in this Guard.ArgumentInfo<Guid> argument)
    {
        if (argument.Value == default) // Check whether the GUID is empty.
        {
            throw Guard.Fail(new ArgumentException(
                $"{argument.Name} is not initialized. " +
                "Consider using the static Guid.NewGuid method.",
                argument.Name));
        }

        return ref argument;
    }
}

public class Program
{
    public Record GetRecord(Guid id)
    {
        Guard.Argument(() => id).NotEmpty();
    }
}
```

What Did We Do?

* We wrote an extension method for `ArgumentInfo<Guid>`.
* We accepted the argument as a `readonly reference`
  and returned the same reference.
* We passed the argument name to the `ArgumentException`, also mentioning it in the exception message.
* We passed the exception to `Guard.Fail` before throwing it to support `scopes`.

What if the argument was nullable?

```cs
public class Program
{
    public Record GetRecord(Guid? id)
    {
        // This won't compile since the id is not a Guid, it's a Nullable<Guid>.
        Guard.Argument(() => id).Valid();
    
        // Calling NotNull converts the ArgumentInfo<Guid?> to an ArgumentInfo<Guid>.
        // After that we can use our NotEmpty extension.
        Guard.Argument(() => id).NotNull().NotEmpty();
    }
}
```

But forcing the argument to be non-null contradicts the convention followed by the standard validations where null arguments are ignored.

Let's add an overload to our extension, this time specifically for nullable GUIDs.

```cs
public static class GuardExtensions
{
    public static ref readonly Guard.ArgumentInfo<Guid?> NotEmpty(
        in this Guard.ArgumentInfo<Guid?> argument)
    {
        if (argument.HasValue() && // Ignore if the GUID is null.
            argument.Value.Value == default) // Check whether the GUID is empty.
        {
            throw Guard.Fail(new ArgumentException(
                $"{argument.Name} is not initialized. " +
                "Consider using the static Guid.NewGuid method.",
                argument.Name));
        }

        return ref argument;
    }
}

public class Program
{
    public Record GetRecord(Guid? id)
    {
        // Ignored if `id` is null.
        Guard.Argument(() => id).NotEmpty();
    }
}
```

What Did We Do?

* We wrote an extension method for `ArgumentInfo<Guid?>`.
* We used the `HasValue` method to check whether the GUID is null.
* We ignored the arguments that are null.
* The rest is the same with our non-nullable validation.

**Accepting and Returning the Argument by Reference**

Being a struct, `ArgumentInfo<T>` is subject to copy-by-value semantics. This means that it would
get copied once to send it as a parameter, and once to return it to the caller with each validation.
Think of a validation chain like `.NotNull().CountInRange(1, 5).DoesNotContainNull()`.
This would cause our argument instance to be copied six times if we didn't accept and returned
it as reference.

Sending and returning values as reference add a small overhead but it's negligible for values
heavier than four bytes and the benefits start to overweight this overhead as the value gets bigger.
An `ArgumentInfo<T>` instance contains three fields:
* The value of the argument of type `T`.
* A string that contains the argument name.
* A boolean that is used to determine whether the argument is `modified`.
* A boolean that is used to determine whether the exception messages should not contain `sensitive information`.

So an `ArgumentInfo<int>` instance on a 32-bit system is _at least_ 10 bytes and an
`ArgumentInfo<long>` instance on a 64-bit system is _at least_ 18 bytes. Even more if we use heavier
structs like a `Guid` or `decimal`. So accepting and returning our validation arguments as reference
allows us to avoid copying heavier instances around.

**The HasValue Method**

In our examples above where we specifically targeted GUID arguments, we could just check whether the
argument is null by writing `argument.Value != null`.  Using `argument.HasValue()` here made no
difference. But if we targeted a generic argument `T` where `T` is a struct, the `argument.Value != null` check
would cause boxing.

```cs
public interface IDuck
{
    bool CanQuack { get; }

    string Quack();
}

public class RefDuck : IDuck { /*...*/ }

public struct ValueDuck : IDuck { /*...*/ }

public static class GuardExtensions
{
    public static ref readonly Guard.ArgumentInfo<T> CanQuack<T>(
        in this Guard.ArgumentInfo<T> argument)
        where T : IDuck
    {
        // Writing `argument.Value != null` here would box a `ValueDuck`.
        if (argument.HasValue() && !argument.Value.CanQuack)
        {
            // Throw is it is a non-null duck who sadly cannot quack.
            throw Guard.Fail(new ArgumentException(
                $"{argument.Name} must be able to quack.", argument.Name));
        }

        return ref argument;
    }
}

public class Program
{
    public static void Main()
    {
        var refDuck = new RefDuck();
        MakeItQuack(refDuck);

        var valueDuck = new ValueDuck();
        MakeItQuack(valueDuck); // No boxing.
    }

    public static void MakeItQuack<T>(T duck)
        where T : IDuck
    {
        Guard.Argument(() => duck).CanQuack();

        Console.WriteLine(duck.Quack());
    }
}
```

## Reference(s)

Most of the information in this article has gathered from various references.

* https://github.com/safakgur/guard