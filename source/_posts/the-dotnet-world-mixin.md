---
title: The .NET World - Mixin
date: July 28 2023
category: dotnet
tags:
  - dotnet
  - mixon
  - extension-method
  - default-interface-method
---

In object-oriented programming, a mixin is a type that contains methods for use by other classes without having to be the parent class of those other classes. C# does not natively support mixins, but developers have come up with various ways to mimic this functionality. 

In this article, we will explore four methods of implementing mixins in C#: 

1. Stateless mixins using extension methods
2. Stateless mixins using default interface methods
3. Stateful mixins using extension methods
4. Stateful mixins using default interface methods

## 1. Stateless Mixins with Extension Methods

The first method employs extension methods to add behavior to classes that implement a specific interface, often referred to as a "marker interface". Here's an example of a mixin named `IPrintable`, which provides a `Print` method:

```csharp
public interface IPrintable { }

public static class PrintableExtensions
{
    public static void Print(this IPrintable printable, string message)
    {
        Console.WriteLine(message);
    }
}
```

We can apply this mixin to any class:

```csharp
public class MyClass : IPrintable { }
```

And then utilize the `Print` method:

```csharp
var myObject = new MyClass();
myObject.Print("Hello, world!"); // Outputs "Hello, world!"
```

This approach cannot add properties or state to the mixin because C# does not support extension properties.

## 2. Stateless Mixins with Default Interface Methods

In C# 8.0, default interface methods were introduced. These allow us to define methods with a default implementation directly in the interface itself, creating an opportunity to build mixins. Here's an example:

```csharp
public interface IPrintable
{
    void Print(string message)
    {
        Console.WriteLine(message);
    }
}
```

Now any class implementing `IPrintable` can call the `Print` method:

```csharp
public class MyClass : IPrintable { }

var myObject = new MyClass();
myObject.Print("Hello, world!"); // Outputs "Hello, world!"
```

This method allows properties to be added directly to the interface. However, these properties cannot hold any state:

```csharp
public interface IPrintable
{
    string Creator { get; set; }

    void Print(string message)
    {
        Console.WriteLine(message);
    }
}
```

Any class that implements `IPrintable` will have a `Creator` property and a `Print` method.

## 3. Stateful Mixins with Extension Methods

For stateful mixins using extension methods, we can use the `ConditionalWeakTable` class, which lets us associate additional data with instances of a class without altering the class itself. This approach uses a marker interface and a static extension class, with the `ConditionalWeakTable` holding the state of the mixin.

Here's an example of a stateful `IPrintable` mixin, which keeps track of the number of times `Print` has been called:

```csharp
public interface IPrintable { }

public static class PrintableExtensions
{
    private sealed class PrintableState
    {
        internal int PrintCount;
    }

    private static readonly ConditionalWeakTable<IPrintable, PrintableState> stateTable =
        new ConditionalWeakTable<IPrintable, PrintableState>();

    public static void Print(this IPrintable printable, string message)
    {
        var state = stateTable.GetOrCreateValue(printable);
        state.PrintCount++;
        Console.WriteLine($"{message} (Printed {state.PrintCount} times)");
    }
}
```

This mixin can be used in the same way as previous ones, but the `Print` method now has a state:

```csharp
var myObject = new MyClass();
myObject.Print("Hello, world!"); // Outputs "Hello, world! (Printed 1 times)"
myObject.Print("Hello again!"); // Outputs "Hello again! (Printed 2 times)"
```

While properties cannot hold a state due to the lack of support for extension properties, properties can be simulated through methods:

```csharp
public static void SetCreator(this IPrintable printable, string creator)
{
    // Save the creator
}

public static string GetCreator(this IPrintable printable)
{
    // Retrieve and return the creator
    return "Placeholder"; 
}
```

## 4. Stateful Mixins with Default Interface Methods

Finally, stateful mixins can be implemented using default interface methods, and a similar `ConditionalWeakTable` technique as before. Here's a more complex example of an `IPrintable` interface with multiple methods and properties:

```csharp
public interface IPrintable
{
    private sealed class PrintableState
    {
        internal int PrintCount;
        internal int ErrorCount;
    }

    private static readonly ConditionalWeakTable<IPrintable, PrintableState> stateTable =
        new ConditionalWeakTable<IPrintable, PrintableState>();

    string Creator { get; set; }
    string DocumentName { get; set; }

    void Print(string message)
    {
        var state = stateTable.GetOrCreateValue(this);
        state.PrintCount++;
        Console.WriteLine($"{message} (Printed {state.PrintCount} times)");
    }

    void Error(string message)
    {
        var state = stateTable.GetOrCreateValue(this);
        state.ErrorCount++;
        Console.WriteLine($"{message} (Error number {state.ErrorCount})");
    }
}
```

Now, `Creator` and `DocumentName` are regular properties and can hold state as long as the `IPrintable` instance exists:

```csharp
IMixinExample myClass = new MyClass();
myClass.Creator = "John Doe";
myClass.DocumentName = "My First Document";
Console.WriteLine(myClass.Creator); // Outputs "John Doe"
Console.WriteLine(myClass.DocumentName); // Outputs "My First Document"
myClass.Print("Hello, world!"); // Outputs "Hello, world! (Printed 1 times)"
myClass.Error("Something went wrong."); // Outputs "Something went wrong. (Error number 1)"
```

As shown, it's possible to develop fairly complex and feature-rich mixins in C# despite the limitations regarding mixin implementation. Depending on your specific use case, these methods can offer a powerful way to add functionality to your classes.

## Conclusion

While C# does not natively support mixins, various methods exist to imitate them. Each technique has its own strengths and weaknesses, so the best choice depends on the specific use case. However, with a little ingenuity, mixins can become a potent tool in your C# toolbox.



## Reference(s)

Most of the information in this article has gathered from various references.

* https://learn.microsoft.com/en-us/dotnet/csharp/advanced-topics/interface-implementation/mixins-with-default-interface-methods
* https://www.c-sharpcorner.com/article/learn-about-mixin-pattern/
* https://www.c-sharpcorner.com/UploadFile/b942f9/how-to-create-mixin-using-C-Sharp-4-0/
