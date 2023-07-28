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

In object-oriented programming, a mixin is a type that contains methods for use by other classes without having to be the parent class of those other classes. C# does not natively support mixins, but developers have devised various ways to mimic this functionality. 

Pros:

1. **Code Reusability**: Mixins can encapsulate behaviour that can be reused across different classes. It promotes the DRY (Don't Repeat Yourself) principle.

2. **Code Organization**: Mixins allow us to separate different functionalities into different classes, making the code easier to read and maintain.

3. **Flexibility**: Unlike inheritance, where a class can only inherit from a single class, a class can mix in multiple other classes, providing more flexibility.

4. **Avoiding Class Explosion**: In languages or scenarios where multiple inheritances are not allowed or lead to complexity, mixins can add class functionality without creating new subclasses for every possible combination of behaviours.

Cons:

1. **Complexity**: Mixins can increase complexity, as it may take time to determine where a particular method or property is defined. Using multiple mixins can lead to problems understanding the flow and interaction of different class functionalities.

2. **Conflicts**: If two mixins implement a method with the same name, it can lead to naming conflicts. This could lead to unexpected behaviour if not properly managed.

3. **Indirection**: Mixins introduce an additional level of indirection, making code harder to understand and debug.

4. **Lack of Explicit Support in C#**: As C# does not natively support mixins, the workaround solutions (like using extension methods on interfaces) may not be as clean and straightforward as in languages that support them directly. This may lead to additional complexity or misuse.

So, the need for mixins comes from the requirement of sharing functionality across classes that do not share a common parent in the class hierarchy outside of the base object class. They can be a powerful tool when used properly but can lead to confusion and complexity when misused.

In this article, we will explore four methods of implementing mixins in C#: 

1. Stateless mixins using extension methods
2. Stateless mixins using default interface methods
3. Stateful mixins using extension methods
4. Stateful mixins using default interface methods

## 1. Stateless Mixins with Extension Methods

The first method employs extension methods to add behaviour to classes that implement a specific interface, often called a "marker interface". Here's an example of a mixin named `IPrintable`, which provides a `Print` method:

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

We can use the `ConditionalWeakTable` class for stateful mixins using extension methods, which lets us associate additional data with class instances without altering the class itself. This approach uses a marker interface and a static extension class, with the `ConditionalWeakTable` holding the state of the mixin.

The `ConditionalWeakTable<TKey, TValue>` is used in stateful mixins in C# because it holds weak references to its keys, allowing them to be garbage collected when no other strong references exist. Unlike a regular `Dictionary`, where keys (and associated values) are kept in memory as long as the dictionary exists, potentially causing memory leaks or undesired extension of object lifetimes, `ConditionalWeakTable` allows the garbage collector to automatically remove the entries when the key objects are collected, thus ensuring more efficient memory usage and preventing unintentional lifetime extension of the associated objects. This makes it a preferred choice for associating state with objects in mixins.

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

Most of the information in this article has been gathered from various references.

* https://learn.microsoft.com/en-us/dotnet/csharp/advanced-topics/interface-implementation/mixins-with-default-interface-methods
* https://www.c-sharpcorner.com/article/learn-about-mixin-pattern/
* https://www.c-sharpcorner.com/UploadFile/b942f9/how-to-create-mixin-using-C-Sharp-4-0/
