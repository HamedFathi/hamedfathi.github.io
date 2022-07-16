---
title: The .NET World - C# Source Generator
date: December 8 2020
category: dotnet
tags:
    - dotnet
    - dotnet5
    - sourcegenerator
    - roslyn
    - csharp9
    - csharp
---

I want to talk about one of the most exciting new features in `C# 9`. A way to generate the source code you want and access it instantly in your editor. Stay tuned.

<!-- more -->

## What is a source generator?

A Source Generator is a new kind of component that C# developers can write that lets you do two major things:

1. Retrieve a Compilation object that represents all user code that is being compiled. This object can be inspected and you can write code that works with the syntax and semantic models for the code being compiled, just like with analyzers today.
2. Generate C# source files that can be added to a Compilation object during the course of compilation. In other words, you can provide additional source code as input to a compilation while the code is being compiled.
When combined, these two things are what make Source Generators so useful. You can inspect user code with all of the rich metadata that the compiler builds up during compilation, then emit C# code back into the same compilation that is based on the data you’ve analyzed! If you’re familiar with Roslyn Analyzers, you can think of Source Generators as analyzers that can emit C# source code.

Source generators run as a phase of compilation visualized below:

![](/images/the-dotnet-world-csharp-source-generator/sg.png)

A Source Generator is a .NET Standard 2.0 assembly that is loaded by the compiler along with any analyzers. It is usable in environments where .NET Standard components can be loaded and run.

## What are its prerequisites?

* C# 9.0+ (SDK 5.0.100+)
* Microsoft Visual Studio 16.8.0+ or JetBrains Rider 2020.3.0+

## What are its limitations?

* Source Generators **do not allow** you to **rewrite** user source code. You can only augment a compilation by **adding** C# source files to it.
* Run **un-ordered**, each generator will see the same input compilation, with **no access** to files created by other source generators.

## What is the scenario?

The need to mock static methods in order to add a unit test is a very common problem. It’s often the case that these static methods are in third-party libraries. There are many utility libraries that are completely made up of static methods. While this makes them very easy to use, it makes them really difficult to test.

The way to mock a static method is by creating **a class that wraps the call**, **extracting an interface**, and **passing in the interface**. Then from your unit tests you can create a mock of the interface and pass it in.

In the following, we describe this method and choose `Dapper` as a real-world example to show you how a wrapper class and interface helps us to test its static (extension) methods.

**What is Dapper?**

> A simple object mapper for .Net.

```cs
public class Student
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Family { get; set; }
    public DateTime BirthDate { get; set; }
}

var student = connection.Query<Student>("SELECT * FROM STUDENT);
```

[Dapper](https://github.com/StackExchange/Dapper) contains a lot of extension (static) methods so I'm going to look at how to mock its methods with the instruction above.

**Solution structure**

Make `MockableStaticGenerator` solution with these projects:

| Name                    | Template           | Target         |
|-------------------------|--------------------|----------------|
| MockableStaticGenerator | class library      | netstandard2.0 |
| DapperSample            | class library      | netstandard2.0 |
| DapperSampleTest        | xUnit test project | net5.0         |

![](/images/the-dotnet-world-csharp-source-generator/solution.png)

**MockableStaticGenerator**

Open `MockableStaticGenerator` project and add the following configuration to `csproj` file.

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>netstandard2.0</TargetFramework>
    <Version>0.0.1</Version>
    <PackageId>MockableStaticGenerator</PackageId>
    <LangVersion>latest</LangVersion>
    <GeneratePackageOnBuild>true</GeneratePackageOnBuild>
    <IncludeBuildOutput>false</IncludeBuildOutput>
	<EmitCompilerGeneratedFiles>true</EmitCompilerGeneratedFiles>
    <CompilerGeneratedFilesOutputPath>$(BaseIntermediateOutputPath)Generated</CompilerGeneratedFilesOutputPath>
  </PropertyGroup>
  <PropertyGroup>
    <RestoreAdditionalProjectSources>https://pkgs.dev.azure.com/dnceng/public/_packaging/dotnet5/nuget/v3/index.json ;$(RestoreAdditionalProjectSources)</RestoreAdditionalProjectSources>
  </PropertyGroup>
  <ItemGroup>
    <None Include="$(OutputPath)\$(AssemblyName).dll" Pack="true" PackagePath="analyzers/dotnet/cs" Visible="false" />
  </ItemGroup>
  <ItemGroup>
    <PackageReference Include="Microsoft.CodeAnalysis.CSharp.Workspaces" Version="3.8.0" PrivateAssets="all" />
    <PackageReference Include="Microsoft.CodeAnalysis.Analyzers" Version="3.3.2">
      <PrivateAssets>all</PrivateAssets>
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
    </PackageReference>
  </ItemGroup>
</Project>
```

Make sure both below packages are installed.

```bash
Install-Package Microsoft.CodeAnalysis.Analyzers -Version 3.3.2
dotnet add package Microsoft.CodeAnalysis.Analyzers --version 3.3.2
<PackageReference Include="Microsoft.CodeAnalysis.Analyzers" Version="3.3.2">
  <PrivateAssets>all</PrivateAssets>
  <IncludeAssets>runtime; build; native; contentfiles; analyzers</IncludeAssets>
</PackageReference>

Install-Package Microsoft.CodeAnalysis.CSharp.Workspaces -Version 3.8.0
dotnet add package Microsoft.CodeAnalysis.CSharp.Workspaces --version 3.8.0
<PackageReference Include="Microsoft.CodeAnalysis.CSharp.Workspaces" Version="3.8.0" />
```

**DapperSample**

Install the below package

```bash
Install-Package Dapper -Version 2.0.78
dotnet add package Dapper --version 2.0.78
<PackageReference Include="Dapper" Version="2.0.78" />
```

Then, make each below file in the project.

```cs
// Student.cs
using System;

public class Student
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Family { get; set; }
    public DateTime BirthDate { get; set; }
}

// IStudentRepository.cs
using System.Collections.Generic;

public interface IStudentRepository
{
    IEnumerable<Student> GetStudents();
}

// StudentRepository.cs
using Dapper;
using System.Collections.Generic;
using System.Data;

public class StudentRepository : IStudentRepository
{
    private readonly IDbConnection _dbConnection;

    public StudentRepository(IDbConnection dbConnection)
    {
        _dbConnection = dbConnection;
    }

    public IEnumerable<Student> GetStudents()
    {
        return _dbConnection.Query<Student>("SELECT * FROM STUDENT");
    }
}
```

**DapperSampleTest**

Install below package 

```bash
Install-Package Moq -Version 4.15.2
dotnet add package Moq --version 4.15.2
<PackageReference Include="Moq" Version="4.15.2" />
```

Then, add `DapperSample` project reference to this.

Now, we are able to test our repository.

```cs
// StudentRepositoryTest.cs

using DapperSample;
using Moq;
using System.Data;
using Xunit;

namespace DapperSampleTest
{
    public class StudentRepositoryTest
    {
        [Fact]
        public void STUDENT_REPOSITORY_TEST()
        {
            var mockConn = new Mock<IDbConnection>();
            var sut = new StudentRepository(mockConn.Object);
            var stu = sut.GetStudents();
            Assert.NotNull(stu);
        }
    }
}
```

![](/images/the-dotnet-world-csharp-source-generator/solution2.png)

**How is the test run and what happens next?**

Run the test then you will get a error like below

```bash
 DapperSampleTest.StudentRepositoryTest.STUDENT_REPOSITORY_TEST
   Source: StudentRepositoryTest.cs line 11
   Duration: 92 ms

  Message: 
    System.NullReferenceException : Object reference not set to an instance of an object.
  Stack Trace: 
    CommandDefinition.SetupCommand(IDbConnection cnn, Action`2 paramReader) line 113
    SqlMapper.QueryImpl[T](IDbConnection cnn, CommandDefinition command, Type effectiveType)+MoveNext() line 1080
    List`1.ctor(IEnumerable`1 collection)
    Enumerable.ToList[TSource](IEnumerable`1 source)
    SqlMapper.Query[T](IDbConnection cnn, String sql, Object param, IDbTransaction transaction, Boolean buffered, Nullable`1 commandTimeout, Nullable`1 commandType) line 725
    StudentRepository.GetStudents() line 18
    StudentRepositoryTest.STUDENT_REPOSITORY_TEST() line 15
```

You may have guessed why. Because  mock object of `IDbConnection` has no `Query` method in his interface. This is the problem.

**How to fix it?**

> The way to mock a static method is by creating **a class that wraps the call**, **extracting an interface**, and **passing in the interface**. Then from your unit tests you can create a mock of the interface and pass it in.

Do this step-by-step changes just like above instruction and add them to `DapperSample` project.

1. Extracting an interface.

```cs
// IDapperSqlMapper.cs
using System.Collections.Generic;
using System.Data;

public interface IDapperSqlMapper
{
    IEnumerable<T> Query<T>(IDbConnection cnn, string sql, object param = null, IDbTransaction transaction = null, bool buffered = true, int? commandTimeout = null, CommandType? commandType = null);
}
```

The `Query` is the same as what `Dapper` has.

2. A class that wraps the (static) call.

```cs
// DapperSqlMapper.cs
using Dapper;
using System.Collections.Generic;
using System.Data;

public class DapperSqlMapper : IDapperSqlMapper
{
    public IEnumerable<T> Query<T>(IDbConnection cnn, string sql, object param = null, IDbTransaction transaction = null, bool buffered = true, int? commandTimeout = null, CommandType? commandType = null)
    {
        // Dapper 'Query' method is here.
        return cnn.Query<T>(sql, param, transaction, buffered, commandTimeout, commandType);
    }
}
```

3. Change your `StudentRepository` class.

```cs
// StudentRepository.cs
using System.Collections.Generic;
using System.Data;

public class StudentRepository : IStudentRepository
{
    private readonly IDbConnection _dbConnection;
    private readonly IDapperSqlMapper _dapperSqlMapper;

    public StudentRepository(IDbConnection dbConnection, IDapperSqlMapper dapperSqlMapper)
    {
        _dbConnection = dbConnection;
        _dapperSqlMapper = dapperSqlMapper;
    }

    public IEnumerable<Student> GetStudents()
    {
        return _dapperSqlMapper.Query<Student>(_dbConnection, "SELECT * FROM STUDENT");
    }
}
```

Now change your test in `DapperSampleTest` project as following.

```cs
using DapperSample;
using Moq;
using System.Data;
using Xunit;

namespace DapperSampleTest
{
    public class StudentRepositoryTest
    {
        [Fact]
        public void STUDENT_REPOSITORY_TEST()
        {
            var mockConn = new Mock<IDbConnection>();
            var mockDapper = new Mock<IDapperSqlMapper>();
            var sut = new StudentRepository(mockConn.Object, mockDapper.Object);
            var stu = sut.GetStudents();
            Assert.NotNull(stu);
        }
    }
}
```

Run the test, you will see the green result!

![](/images/the-dotnet-world-csharp-source-generator/solution3.png)

**What is the new problem?**

Everything is good but **very tough repetitive** work especially when you are using external libraries like `Dapper` with a lot of extension (static) methods to use.

What if this repetitive method was already prepared for all methods?

## How does a source generator help us solve this problem?

So far, we have learned about the problem and how to deal with it. But now we want to use a source generator to reduce the set of these repetitive tasks to zero.

What if I have **both** of the following possibilities?

* Generate a wrapper class like above sample for `Math` class in background.

```cs
// Internal usage
// My class with a lot of static (extension) methods.

[MockableStatic]
public class Math
{
    public static int Add(int a, int b) { return a + b; }
    public static int Sub(int a, int b) { return a - b; }
}
```

* Generate a wrapper class for `Dapper.SqlMapper` that exists in `Dapper` assembly in background.

```cs
// External usage
// A referenced assembly with a type that contains a lot of static (extension) methods.

[MockableStatic(typeof(Dapper.SqlMapper))]
public class StudentRepositoryTest
{
    // ...
}
```

If you think it's a good idea, stay tuned.

## How to write a source generator?

First of all, go to your `MockableStaticGenerator` project. Add `SourceGeneratorExtensions.cs` to the project.

```cs
// SourceGeneratorExtensions.cs
namespace Microsoft.CodeAnalysis
{
    internal static class SourceGeneratorExtensions
    {
        // ...
    }        
}
```

For achieving our ultimate goal we need some useful extension methods to make source code so I will add them to `SourceGeneratorExtensions` class.

Now, Create `SyntaxReceiver` class as following:

```cs
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using System.Collections.Generic;

namespace MockableStaticGenerator
{
    internal class SyntaxReceiver : ISyntaxReceiver
    {
        internal List<ClassDeclarationSyntax> Classes { get; } = new List<ClassDeclarationSyntax>();

        public void OnVisitSyntaxNode(SyntaxNode syntaxNode)
        {
            if (syntaxNode is ClassDeclarationSyntax classDeclarationSyntax
                && classDeclarationSyntax.AttributeLists.Count > 0)
            {
                Classes.Add(classDeclarationSyntax);
            }
        }
    }
}
```

The purpose of this class is to **identify** the nodes we need to process the current source and generate new code. Here we store all the received classes in the `Classes` property.

Then, Create `MockableGenerator` class with below code.

```cs
using Microsoft.CodeAnalysis;

namespace MockableStaticGenerator
{
    [Generator]
    public class MockableGenerator : ISourceGenerator
    {
        public void Execute(GeneratorExecutionContext context)
        {
            
        }

        public void Initialize(GeneratorInitializationContext context)
        {
            context.RegisterForSyntaxNotifications(() => new SyntaxReceiver());
        }
    }
}
```

As you can see, You should implement `ISourceGenerator` and add `[Generator]` attribute to your source generator class.

There are two methods:

**Initialize(GeneratorInitializationContext context)**

The process of generating code starts with this method, so we get the target classes by registering our `SyntaxReceiver`.

**Execute(GeneratorExecutionContext context)**

You should write how to generate your code in this section and introduce the final output to the compiler.

For next step, add `Constants` class as following to your project.

```cs
namespace MockableStaticGenerator
{
    internal static class Constants
    {
        internal const string MockableStaticAttribute = @"
            namespace System
            {
                [AttributeUsage(AttributeTargets.Class, Inherited = false, AllowMultiple = false)]
                public sealed class MockableStaticAttribute : Attribute
                {
                    public MockableStaticAttribute()
                    {
                    }
                    public MockableStaticAttribute(Type type)
                    {
                    }
                }
            }";
    }
}
```

As I explained before, We need an attribute (`MockableStaticAttribute`) to annotate our classes. So, we will use above source code text in our source generator.  

* `[MockableStatic]` useful for internal usage and current class.
* `[MockableStatic(typeof(Dapper.SqlMapper))]` useful for external usage and making a wrapper for an external type.

![](/images/the-dotnet-world-csharp-source-generator/solution4.png)

Let's go to the `Execute` method, Add below code to it

```cs
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.Text;
using System.Text;

public void Execute(GeneratorExecutionContext context)
{
    // 1
    context.AddSource(nameof(Constants.MockableStaticAttribute), SourceText.From(Constants.MockableStaticAttribute, Encoding.UTF8));

    // 2
    if (!(context.SyntaxReceiver is SyntaxReceiver receiver))
        return;

    // 3
    CSharpParseOptions options = (context.Compilation as CSharpCompilation).SyntaxTrees[0].Options as CSharpParseOptions;
    Compilation compilation = context.Compilation.AddSyntaxTrees(CSharpSyntaxTree.ParseText(SourceText.From(Constants.MockableStaticAttribute, Encoding.UTF8), options));
    INamedTypeSymbol attributeSymbol = compilation.GetTypeByMetadataName($"System.{nameof(Constants.MockableStaticAttribute)}");
}
```

(1) we added our `MockableStaticAttribute` text source to the project.

(2) I checked if there is no `SyntaxReceiver` just return without any generated code.

(3) The most important part is finding our `MockableStaticAttribute` text source from syntax tree and use its information.

In summary, You need to add source code text as a part of project then get it from compiler as a Symbol type to work with it in strongly typed way.

```cs
// 3
// ...
// 4
var sources = new StringBuilder();
// 5
var assemblyName = "";
// 6
foreach (var cls in receiver.Classes)
{
    // 7
    SemanticModel model = compilation.GetSemanticModel(cls.SyntaxTree);
    var clsSymbol = model.GetDeclaredSymbol(cls);

    // 8
    var attr = clsSymbol.GetAttributes().FirstOrDefault(ad => ad.AttributeClass.Equals(attributeSymbol, SymbolEqualityComparer.Default));

    // 9
    if (attr == null) continue;
    
    // 10
    var isParameterlessCtor = attr?.ConstructorArguments.Length == 0;

    // 11
    var sbInterface = new StringBuilder();
    // 12
    var sbClass = new StringBuilder();
```

(4) We need aggregate our sources.

(5) We store assembly name.

(6) Our `SyntaxReceiver` classes were stored in `receiver` variable now we need to use them one-by-one.

(7) Access to current class symbol.

(8) Check it has the same attribute as we want or not.

(9) If not, so go to next item.

(10) As I talked before, We are faced with two source generating models.

I- Parameterless: It generates a wrapper for the annotated class.

```cs
[MockableStatic]
public class Math { }
```

The source generator generates a wrapper for statics methods of `Math` class.

II- With parameter: It gets `typeof` as a parameter.

```cs
[MockableStatic(typeof(Dapper.SqlMapper))]
public class StudentRepository { }
```

The source generator generates a wrapper for statics methods of `SqlMapper` class inside `Dapper` assembly.

(11) (12) The generated class and interface are stored in these variables.

So we continue to work in two parts.

```cs
// 12
// ...
// 13
if (isParameterlessCtor)
{
    // 14
    var methods = cls.DescendantNodes().OfType<MethodDeclarationSyntax>().Where(x => x.IsPublic() && x.IsStatic()).ToList();
    if (methods.Count == 0) continue;

    // 15
    var className = clsSymbol.Name;
    // 16
    var ns = string.IsNullOrEmpty(cls.GetNamespace()) ? "" : cls.GetNamespace() + ".";
    // 17
    var baseList = string.IsNullOrEmpty(cls.BaseList?.ToFullString()) ? ":" : cls.BaseList?.ToFullString().Trim() + ",";
    // 18
    assemblyName = clsSymbol.ContainingAssembly.Identity.Name;
    // 19
    var wrapperClassName = !className.Contains('<') ? className + "Wrapper" : className.Replace("<", "Wrapper<");
    // 20
    var classTypeParameters = cls.GetTypeParameters() ?? "";
    // 21
    var constraintClauses = cls.GetConstraintClauses() ?? "";
    // 22
    sbInterface.AppendLine($"\tpublic partial interface I{wrapperClassName}{classTypeParameters} {constraintClauses} {{");
    // 23
    sbClass.AppendLine($"\tpublic partial class {wrapperClassName}{classTypeParameters} {baseList} I{wrapperClassName}{classTypeParameters} {constraintClauses} {{");
    // 24
    foreach (MethodDeclarationSyntax method in methods)
    {
        // 25
        var text = method.GetSignatureText();

        // 26
        if (!sbInterface.ToString().Contains(text))
            sbInterface.AppendLine($"\t\t{text};");

        // 27
        if (!sbClass.ToString().Contains(text))
        {
            // 28
            var returnKeyword = method.ReturnsVoid() ? "" : "return ";
            
            // 29
            var obsoleteAttrText = "";
            var isObsolete = method.TryGetObsoleteAttribute(out obsoleteAttrText);
            if (isObsolete)
                sbClass.AppendLine($"\t\t{obsoleteAttrText}");

            // 30
            sbClass.AppendLine($"\t\tpublic {method.GetSignatureText()} {{");
            sbClass.AppendLine($"\t\t\t{returnKeyword}{ns}{className}{classTypeParameters}.{method.GetCallableSignatureText()};");
            sbClass.AppendLine($"\t\t}}");
        }
    }

    // 31
    sbInterface.AppendLine($"\t}}");
    sbClass.AppendLine($"\t}}");
}
```

(13) Our class annotated with parameterless attribute.

(14) Find all `public static` methods of the class. If there no one skip the process.

To do this, Add two below extension methods to `SourceGeneratorExtensions` class.

```cs
// SourceGeneratorExtensions.cs
internal static bool IsPublic(this MethodDeclarationSyntax methodDeclarationSyntax)
{
    return methodDeclarationSyntax.Modifiers.Select(x => x.ValueText).Contains("public");
}
internal static bool IsStatic(this MethodDeclarationSyntax methodDeclarationSyntax)
{
    return methodDeclarationSyntax.Modifiers.Select(x => x.ValueText).Contains("static");
}
```

(15) Simple class name.

(16) The Class name with namespace. To find the namespace we need a recursive extension method as following.

```cs
// SourceGeneratorExtensions.cs
internal static string GetNamespace(this SyntaxNode syntaxNode)
{
    return syntaxNode.Parent switch
    {
        NamespaceDeclarationSyntax namespaceDeclarationSyntax => namespaceDeclarationSyntax.Name.ToString(),
        null => string.Empty,
        _ => GetNamespace(syntaxNode.Parent)
    };
}
```

(17) If it has inherited from a class or implemented interfaces, its information is available here.

(18) Assembly name.

(19) We append `Wrapper` to end of the class name. so We will have something like these samples:

`SqlMapper` => ISqlMapper**Wrapper** and SqlMapper**Wrapper**
`SqlMapper<T>` => ISqlMapper**Wrapper**<T> and SqlMapper**Wrapper**<T>

(20) Your class may have type parameters (generic).

Add below method to `SourceGeneratorExtensions` class.

```cs
internal static string GetTypeParameters(this ClassDeclarationSyntax classDeclarationSyntax)
{
    var result = classDeclarationSyntax.TypeParameterList?.ToFullString().Trim();
    return string.IsNullOrEmpty(result) ? null : result;
}
```

Now we can check it there.

(21) If your class is generic, Has it any constraint clauses? With the following extension method we can find out.

```cs
// SourceGeneratorExtensions.cs
internal static string GetConstraintClauses(this ClassDeclarationSyntax classDeclarationSyntax)
{
    var result = classDeclarationSyntax.ConstraintClauses.ToFullString().Trim();
    return string.IsNullOrEmpty(result) ? null : result;
}
```

(22) (23) With current information we are able to create our interface and class for wrapping the main class static methods.

(24) Let's start examining the methods.

(25) We should add our methods to interface so we need to know about its signature.

So add the following extension method to your `SourceGeneratorExtensions` class.

```cs
internal static string GetSignatureText(this MethodDeclarationSyntax methodDeclarationSyntax)
{
    var name = methodDeclarationSyntax.Identifier.ValueText;
    var parameters = methodDeclarationSyntax.ParameterList?.ToFullString().Trim();
    var typeParameters = methodDeclarationSyntax.TypeParameterList?.ToFullString().Trim();
    var constraintClauses = methodDeclarationSyntax.ConstraintClauses.ToFullString().Replace(System.Environment.NewLine, "").Trim();
    var returnType = methodDeclarationSyntax.ReturnType.ToFullString().Trim();

    return $"{returnType} {name}{typeParameters}{parameters} {constraintClauses}".Trim();
}
```

The information it returns includes: 
* Return type.
* Method name.
* Type parameter(s), if it is generic.
* Method parameter(s) (with type and name).
* Constraint Clauses, if it is generic.

(26) We check if there is no same method then we add it to our string builder.

(27) Just previous step we check the same condition for adding to our class string builder.

(28) The method needs `return` keyword or it returns nothing (void).
To find out we need another extension method.

```cs
// SourceGeneratorExtensions.cs

internal static bool ReturnsVoid(this MethodDeclarationSyntax methodDeclarationSyntax)
{
    return methodDeclarationSyntax.ReturnType.ToFullString().Trim() == "void";
}
```

(29) One of the most important things to consider is whether the method is marked with `Obsolete Attribute` or not.

```cs
// SourceGeneratorExtensions.cs

internal static bool TryGetObsoleteAttribute(this MethodDeclarationSyntax methodDeclarationSyntax, out string text)
{
    var attr = methodDeclarationSyntax.AttributeLists.Where(x => x is not null && IsObsolete(x.GetText().ToString())).Select(x => x.GetText().ToString()).ToList();

    text = attr.Count != 0 ? ReplaceFirst(attr[0].Trim(), "Obsolete", "System.Obsolete") : "";
    return attr.Count != 0;

    bool IsObsolete(string text)
    {
        Match match = Regex.Match(text, @"\[\s*Obsolete[Attribute]*\s*\(");
        return match.Success;
    }
    string ReplaceFirst(string text, string search, string replace)
    {
        int pos = text.IndexOf(search);
        if (pos < 0)
        {
            return text;
        }
        return text.Substring(0, pos) + replace + text.Substring(pos + search.Length);
    }
}
```

If yes, we need to add the same `ObsoleteAttribute` to top of our new method.

(30) We need to know how call the main static method inside of a wrapper method so we should add another extension method.

```cs
internal static string GetCallableSignatureText(this MethodDeclarationSyntax methodDeclarationSyntax)
{
    var name = methodDeclarationSyntax.Identifier.ValueText;
    var parameters = methodDeclarationSyntax.ParameterList.GetParametersText();
    var typeParameters = methodDeclarationSyntax.TypeParameterList?.ToFullString().Trim();

    return $"{name}{typeParameters}{parameters}".Trim();
}

internal static string GetParametersText(this ParameterListSyntax parameterListSyntax)
{
    if (parameterListSyntax == null || parameterListSyntax.Parameters.Count == 0) return "()";
    var result = new List<string>();
    foreach (var item in parameterListSyntax.Parameters)
    {
        var variableName = item.Identifier;
        var modifiers = item.Modifiers.Select(x => x.ValueText).ToList();
        var modifiersText = modifiers.Count == 0 ? "" : modifiers.Aggregate((a, b) => a + " " + b);
        result.Add($"{modifiersText} {variableName}");
    }
    return result.Count == 0 ? "()" : $"({result.Aggregate((a, b) => a + ", " + b).Trim()})";
}
```

The information it returns includes: 
* Method name.
* Type parameter(s), if it is generic.
* Method parameter(s) (with name and without type).

Now, We can add the whole wrapper method.

(31) At the end, we should complete our interface and class with final `}`.

Part one finished. What happens if we want to generate a wrapper for a type?

```cs
// 31
// ...
// 32
else
{
    // 33
    var ctor = ((INamedTypeSymbol)attr?.ConstructorArguments[0].Value);
    // 34
    var assemblySymbol = ctor.ContainingAssembly.GlobalNamespace;
    // 35
    assemblyName = ctor.ContainingAssembly.Identity.Name;
    // 36
    var visitor = new MethodSymbolVisitor(ctor.ToDisplayString());
    visitor.Visit(assemblySymbol);
    // 62
    sbInterface.AppendLine(_interfaces.Aggregate((a, b) => a + Environment.NewLine + b) + Environment.NewLine + "\t}");
    sbClass.AppendLine(_classes.Aggregate((a, b) => a + Environment.NewLine + b) + Environment.NewLine + "\t}");
}
```

(32) This part is for constructor with a parameter.

(33) Getting the value of the constructor argument.

(34) Getting the assembly information of the type introduced.

(35) Assembly name.

(36) We need a visitor class to know about static methods of the type introduced in the external assembly. We sends the type's name to the constructor of our visitor because we want to generate wrapper for that type.

To write `MethodSymbolVisitor` add below code to `MockableGenerator` class as a **nested class**.

```cs
// 37
private static readonly List<string> _interfaces = new List<string>();
private static readonly List<string> _classes = new List<string>();

// 38
public class MethodSymbolVisitor : SymbolVisitor
{
    private readonly string _typeName;

    public MethodSymbolVisitor(string typeName)
    {
        _typeName = typeName;
    }
    // 39
    public override void VisitNamespace(INamespaceSymbol symbol)
    {
        foreach (var child in symbol.GetMembers())
        {
            child.Accept(this);
        }
    }
    // 40
    public override void VisitNamedType(INamedTypeSymbol symbol)
    {
        foreach (var child in symbol.GetMembers())
        {
            child.Accept(this);
        }
    }
    // 41
    public override void VisitMethod(IMethodSymbol symbol)
    {
        // 42
        var cls = symbol.ReceiverType;
        var isClass = symbol.ReceiverType.TypeKind == TypeKind.Class;
        var isPublic = string.Equals(symbol.ReceiverType.DeclaredAccessibility.ToString().ToLowerInvariant(), "public", StringComparison.InvariantCultureIgnoreCase);
        
        // 43
        if (isClass && isPublic && symbol.IsStatic && symbol.MethodKind == MethodKind.Ordinary)
        {
            // 44
            var className = cls.Name;
            var classNameWithNs = cls.ToDisplayString();
            // 45
            if (classNameWithNs != _typeName) return;
            // 46
            var wrapperClassName = !className.Contains('<') ? className + "Wrapper" : className.Replace("<", "Wrapper<");
            // 47
            var classTypeParameters = ((INamedTypeSymbol)cls).GetTypeParameters();
            // 48
            var wrapperInterfaceName = $"I{wrapperClassName}{classTypeParameters}";
            // 49
            var constraintClauses = ((INamedTypeSymbol)cls).GetConstraintClauses();
            // 50
            var baseList = ((INamedTypeSymbol)cls).GetBaseList(wrapperInterfaceName);
            // 51
            var returnKeyword = symbol.ReturnsVoid ? "" : "return ";
            // 52
            var methodSignature = symbol.GetSignatureText();
            // 53
            var callableMethodSignature = symbol.GetCallableSignatureText();
            // 54
            var obsoleteAttribute = symbol.GetAttributes().FirstOrDefault(x => x.ToString().StartsWith("System.ObsoleteAttribute("))?.ToString();

            // 55
            var interfaceSource = $"\tpublic partial interface I{wrapperClassName}{classTypeParameters} {constraintClauses} {{";
            var classSource = $"\tpublic partial class {wrapperClassName}{classTypeParameters} {baseList} {constraintClauses} {{";

            // 56
            if (!_interfaces.Contains(interfaceSource))
                _interfaces.Add(interfaceSource);

            // 57
            if (!_classes.Contains(classSource))
                _classes.Add(classSource);

            // 58
            if (!_interfaces.Contains(methodSignature))
            {
                _interfaces.Add($"\t\t{methodSignature};");
            }

            // 59
            if (!_classes.Contains(methodSignature))
            {
                // 60
                if (!string.IsNullOrEmpty(obsoleteAttribute))
                {
                    _classes.Add($"\t\t[{obsoleteAttribute}]");
                }
                // 61
                _classes.Add($"\t\tpublic {methodSignature} {{");
                _classes.Add($"\t\t\t{returnKeyword}{classNameWithNs}.{callableMethodSignature};");
                _classes.Add("\t\t}");
            }
        }
    }
}
```

(37) We need some lists to add our generated source codes.

(38) Our nested `MethodSymbolVisitor` inherits from `SymbolVisitor`.

(39) We should first visit `Namespace` and accepts its members to get to the details we want.

(40) We need to go one step deeper to get to the methods so visit named types and its members.

(41) Now it is the time to get any information we need from methods.

(42) We need to check `ReceiverType`. It should be a `public class`.

(43) If the `ReceiverType` is a `public class` and also the method symbol is an ordinary static method we should continue our journy.

(44) We are able to get class name and its namespace.

(45) If the current class is not same as what we are expecting so we need to skip the whole process.

(46) Just like part one we add `Wrapper` at the end of our interface and class name.

(47) Your class may have type parameters (generic).

Add below method to `SourceGeneratorExtensions` class.

```cs
internal static string GetTypeParameters(this INamedTypeSymbol namedTypeSymbol)
{
    return namedTypeSymbol.TypeParameters.Length == 0 ? ""
        : $"<{namedTypeSymbol.TypeParameters.Select(x => x.Name).Aggregate((a, b) => $"{a}, {b}")}>";
}
```

(48) We create the name and structure of the interface.

(49) If your class is generic, Has it any constraint clauses? With the following extension method we can find out.

```cs
// SourceGeneratorExtensions.cs
internal static string GetConstraintClauses(this INamedTypeSymbol namedTypeSymbol)
{
    if (namedTypeSymbol.TypeParameters.Length == 0) return "";
    var result = new List<string>();
    foreach (var item in namedTypeSymbol.TypeParameters)
    {
        var constraintType = item.ToDisplayString();
        var constraintItems = item.ConstraintTypes.Select(x => x.ToDisplayString()).Aggregate((a, b) => $"{a}, {b}").Trim();
        result.Add($"where {constraintType} : {constraintItems}".Trim());
    }

    return result.Aggregate((a, b) => $"{a} {b}").Trim();
}
```

(50) If it has inherited from a class or implemented interfaces, information can be accessed through the following extension method.

```cs
// SourceGeneratorExtensions.cs

internal static string GetBaseList(this INamedTypeSymbol namedTypeSymbol, params string[] others)
{
    var result = new List<string>();
    if (namedTypeSymbol.BaseType != null && !string.Equals(namedTypeSymbol.BaseType.Name, "object", StringComparison.InvariantCultureIgnoreCase))
        result.Add(namedTypeSymbol.BaseType.Name);
    if (namedTypeSymbol.AllInterfaces.Length != 0)
    {
        foreach (var item in namedTypeSymbol.AllInterfaces)
        {
            result.Add(item.Name);
        }
    }
    if (others != null && others.Length != 0)
    {
        foreach (var item in others)
        {
            if (!string.IsNullOrEmpty(item))
                result.Add(item);
        }
    }
    return result.Count == 0 ? "" : $": {result.Aggregate((a, b) => $"{a}, {b}")}".Trim();
}
```

(51) The method needs `return` keyword or it returns nothing (void).

(52) We should add our methods to interface so we need to know about its signature.

So add the following extension method to your `SourceGeneratorExtensions` class.

```cs
internal static string GetSignatureText(this IMethodSymbol methodSymbol)
{
    var name = methodSymbol.Name;

    var parametersText = methodSymbol.Parameters.Length == 0 ? "()"
        : "(" + methodSymbol.Parameters.Select(x => getKind(x) + $" {x.Type} " + x.Name + getDefaultValue(x))
                          .Aggregate((a, b) => a + ", " + b).Trim() + ")";

    var returnType = methodSymbol.ReturnsVoid ? "void" : methodSymbol.ReturnType.ToDisplayString();
    var typeParameters = methodSymbol.TypeParameters.Length == 0
        ? ""
        : "<" + methodSymbol.TypeParameters.Select(x => x.Name).Aggregate((a, b) => $"{a}, {b}").Trim() + ">";
    var constraintClauses = methodSymbol.TypeParameters.Length == 0
        ? ""
        : methodSymbol.TypeParameters.Select(x => getConstraintClauses(x)).Aggregate((a, b) => $"{a} {b}")
    ;

    return $"{returnType} {name}{typeParameters}{parametersText} {constraintClauses}".Trim();
}

internal static string ToStringValue(this RefKind refKind)
{
    if (refKind == RefKind.RefReadOnly) return "ref readonly";
    switch (refKind)
    {
        case RefKind.Ref:
            return "ref";
        case RefKind.Out:
            return "out";
        case RefKind.In:
            return "in";
        default:
            return "";
    }
}
        
private static string getKind(IParameterSymbol parameterSymbol)
{
    return parameterSymbol.IsParams ? "params" : parameterSymbol.RefKind.ToStringValue();
}

private static string getDefaultValue(IParameterSymbol parameterSymbol)
{
    if (parameterSymbol.HasExplicitDefaultValue)
    {
        if (parameterSymbol.ExplicitDefaultValue == null)
            return $" = null";
        if (parameterSymbol.ExplicitDefaultValue is bool)
            return $" = {parameterSymbol.ExplicitDefaultValue.ToString().ToLowerInvariant()}";
        if (parameterSymbol.ExplicitDefaultValue is string)
            return $" = \"{parameterSymbol.ExplicitDefaultValue}\"";
        else
            return $" = {parameterSymbol.ExplicitDefaultValue}";
    }
    return "";
}

private static string getConstraintClauses(ITypeParameterSymbol typeParameterSymbol)
{
    if (typeParameterSymbol.ConstraintTypes.Length > 0)
    {
        var constraintType = typeParameterSymbol.ToDisplayString();
        var constraintItems = typeParameterSymbol.ConstraintTypes.Select(x => x.ToDisplayString()).Aggregate((a, b) => $"{a}, {b}").Trim();
        return $"where {constraintType} : {constraintItems}".Trim();
    }
    return "";
}
```

The information it returns includes: 
* Return type.
* Method name.
* Type parameter(s), if it is generic.
* Method parameter(s) (with type and name).
* Constraint Clauses, if it is generic.

(53) We need to know how call the main static method inside of a wrapper method so we should add another extension method.

```cs
// SourceGeneratorExtensions.cs
internal static string GetCallableSignatureText(this IMethodSymbol methodSymbol)
{
    var name = methodSymbol.Name;

    var parametersText = methodSymbol.Parameters.Length == 0 ? "()"
        : "(" + methodSymbol.Parameters.Select(x => $"{getKind(x)} {x.Name}")
                          .Aggregate((a, b) => $"{a}, {b}").Trim() + ")";
    var typeParameters = methodSymbol.TypeParameters.Length == 0
        ? ""
        : "<" + methodSymbol.TypeParameters.Select(x => x.Name).Aggregate((a, b) => $"{a}, {b}").Trim() + ">";

    return $"{name}{typeParameters}{parametersText}".Trim();
}
```

The information it returns includes: 
* Method name.
* Type parameter(s), if it is generic.
* Method parameter(s) (with name and without type).

(54) Just like the part one, We should check the method has `ObsoleteAttribute` or not.

(55) It's time to build the interface and the class.

(56) If the generated source code does not include it, add the interface source.

(57) If the generated source code does not include it, add the class source.

(58) Add the method signature to the interface if does not exist.

(59) Add the method signature to the class if does not exist.

(60) If the method have an `ObsoleteAttribute` Add it on top of the generated wrapper method too.

(61) With the whole information we have, we are able to complete the wrapper method.

(62) Finally, we should complete our interface and class with final `}`.

At the end of the `foreach` we have

```cs
foreach (var cls in receiver.Classes)
{
    // ...
    // 63
    var interfaceWrapper = sbInterface.ToString();
    var classWrapper = sbClass.ToString();
    // 64
    sources.AppendLine(interfaceWrapper);
    sources.AppendLine(classWrapper);
}
```

(63) Convert our interface and class string builder to string.

(64) And append them to `sources` variable which we created at the beginning of the source code.

Finally, Our `Execute` method ends with

```cs
// 65
var defaultUsings = new StringBuilder();
defaultUsings.AppendLine("using System;");
defaultUsings.AppendLine("using System.Collections.Generic;");
defaultUsings.AppendLine("using System.Linq;");
defaultUsings.AppendLine("using System.Text;");
defaultUsings.AppendLine("using System.Threading.Tasks;");
var usings = defaultUsings.ToString();
// 66
var src = sources.ToString();
var @namespace = new StringBuilder();
@namespace.AppendLine(usings);
@namespace.AppendLine($"namespace {assemblyName}.MockableGenerated {{");
@namespace.AppendLine(src);
@namespace.Append("}");
var result = @namespace.ToString();
// 67
context.AddSource($"{assemblyName}MockableGenerated", SourceText.From(result,Encoding.UTF8));
```

(65) We are able to add some default using statements.

(66) To use the end result, we need a specific namespace to aggregate all the generated code. As you can see, the final code is accessible through the following namespace.

`Assembly name` + `.MockableGenerated` => **Dapper.MockableGenerated**

(67) Finally, we add all the generated source code to the current source so that the compiler knows about it.

Now, It's time to add `MockableStaticGenerator` project to `DapperSample` as a reference project but you should update `DapperSample.csproj` file as following. 

```xml
<ItemGroup>
  <ProjectReference Include="..\MockableStaticGenerator\MockableStaticGenerator.csproj" 
                    OutputItemType="Analyzer"
                    ReferenceOutputAssembly="false"/>
</ItemGroup>
```

This is not a "normal" `ProjectReference`. It needs the additional 'OutputItemType' and 'ReferenceOutputAssmbly' attributes to act as an analyzor.

So you should be able to access to generated namespace. No need to use `DapperSqlMapper` and `IDapperSqlMapper` any more just update your `StudentRepository` as following

```cs
// StudentRepository.cs

using System.Collections.Generic;
using System.Data;
using System;
using Dapper.MockableGenerated; // HERE

namespace DapperSample
{
    // HERE
    [MockableStatic(typeof(Dapper.SqlMapper))]
    public class StudentRepository : IStudentRepository
    {
        private readonly IDbConnection _dbConnection;
        private readonly ISqlMapperWrapper _dapperSqlMapper;

        public StudentRepository(IDbConnection dbConnection, ISqlMapperWrapper dapperSqlMapper /*HERE*/)
        {            
            _dbConnection = dbConnection;
            _dapperSqlMapper = dapperSqlMapper;
        }

        public IEnumerable<Student> GetStudents()
        {
            return _dapperSqlMapper.Query<Student>(_dbConnection, "SELECT * FROM STUDENT");
        }
    }
}
```

And also `DapperSampleTest` project and `StudentRepositoryTest.cs` file.

```cs
using DapperSample;
using Moq;
using System.Data;
using Xunit;
using Dapper.MockableGenerated; // HERE

namespace DapperSampleTest
{
    public class StudentRepositoryTest
    {
        [Fact]
        public void STUDENT_REPOSITORY_TEST()
        {            
            var mockConn = new Mock<IDbConnection>();
            var mockDapper = new Mock<ISqlMapperWrapper>(); // HERE
            var sut = new StudentRepository(mockConn.Object, mockDapper.Object /*HERE*/);
            var stu = sut.GetStudents();
            Assert.NotNull(stu);
        }
    }
}
```

You can find the whole source code here:

```cs
// SourceGeneratorExtensions.cs

using Microsoft.CodeAnalysis.CSharp.Syntax;
using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Linq;
using System.Text.RegularExpressions;

namespace Microsoft.CodeAnalysis
{
    internal static class SourceGeneratorExtensions
    {
        internal static string ToStringValue(this RefKind refKind)
        {
            if (refKind == RefKind.RefReadOnly) return "ref readonly";
            switch (refKind)
            {
                case RefKind.Ref:
                    return "ref";
                case RefKind.Out:
                    return "out";
                case RefKind.In:
                    return "in";
                default:
                    return "";
            }
        }

        internal static bool IsPublic(this ISymbol symbol)
        {
            return string.Equals(symbol.DeclaredAccessibility.ToString(), "public", StringComparison.InvariantCultureIgnoreCase);
        }

        internal static string GetTypeParameters(this ClassDeclarationSyntax classDeclarationSyntax)
        {
            var result = classDeclarationSyntax.TypeParameterList?.ToFullString().Trim();
            return string.IsNullOrEmpty(result) ? null : result;
        }

        internal static string GetConstraintClauses(this ClassDeclarationSyntax classDeclarationSyntax)
        {
            var result = classDeclarationSyntax.ConstraintClauses.ToFullString().Trim();
            return string.IsNullOrEmpty(result) ? null : result;
        }

        internal static bool IsPublic(this MethodDeclarationSyntax methodDeclarationSyntax)
        {
            return methodDeclarationSyntax.Modifiers.Select(x => x.ValueText).Contains("public");
        }
        internal static bool IsStatic(this MethodDeclarationSyntax methodDeclarationSyntax)
        {
            return methodDeclarationSyntax.Modifiers.Select(x => x.ValueText).Contains("static");
        }

        internal static bool ReturnsVoid(this MethodDeclarationSyntax methodDeclarationSyntax)
        {
            return methodDeclarationSyntax.ReturnType.ToFullString().Trim() == "void";
        }

        internal static string GetSignatureText(this MethodDeclarationSyntax methodDeclarationSyntax)
        {
            var name = methodDeclarationSyntax.Identifier.ValueText;
            var parameters = methodDeclarationSyntax.ParameterList?.ToFullString().Trim();
            var typeParameters = methodDeclarationSyntax.TypeParameterList?.ToFullString().Trim();
            var constraintClauses = methodDeclarationSyntax.ConstraintClauses.ToFullString().Replace(System.Environment.NewLine, "").Trim();
            var returnType = methodDeclarationSyntax.ReturnType.ToFullString().Trim();

            return $"{returnType} {name}{typeParameters}{parameters} {constraintClauses}".Trim();
        }


        internal static string GetParametersText(this ParameterListSyntax parameterListSyntax)
        {
            if (parameterListSyntax == null || parameterListSyntax.Parameters.Count == 0) return "()";
            var result = new List<string>();
            foreach (var item in parameterListSyntax.Parameters)
            {
                var variableName = item.Identifier;
                var modifiers = item.Modifiers.Select(x => x.ValueText).ToList();
                var modifiersText = modifiers.Count == 0 ? "" : modifiers.Aggregate((a, b) => a + " " + b);
                result.Add($"{modifiersText} {variableName}");
            }
            return result.Count == 0 ? "()" : $"({result.Aggregate((a, b) => a + ", " + b).Trim()})";
        }

        internal static string GetCallableSignatureText(this MethodDeclarationSyntax methodDeclarationSyntax)
        {
            var name = methodDeclarationSyntax.Identifier.ValueText;
            var parameters = methodDeclarationSyntax.ParameterList.GetParametersText();
            var typeParameters = methodDeclarationSyntax.TypeParameterList?.ToFullString().Trim();

            return $"{name}{typeParameters}{parameters}".Trim();
        }

        internal static bool TryGetObsoleteAttribute(this MethodDeclarationSyntax methodDeclarationSyntax, out string text)
        {
            var attr = methodDeclarationSyntax.AttributeLists.Where(x => x is not null && IsObsolete(x.GetText().ToString())).Select(x => x.GetText().ToString()).ToList();

            text = attr.Count != 0 ? ReplaceFirst(attr[0].Trim(), "Obsolete", "System.Obsolete") : "";
            return attr.Count != 0;

            bool IsObsolete(string text)
            {
                Match match = Regex.Match(text, @"\[\s*Obsolete[Attribute]*\s*\(");
                return match.Success;
            }
            string ReplaceFirst(string text, string search, string replace)
            {
                int pos = text.IndexOf(search);
                if (pos < 0)
                {
                    return text;
                }
                return text.Substring(0, pos) + replace + text.Substring(pos + search.Length);
            }
        }

        internal static string GetNamespace(this SyntaxNode syntaxNode)
        {
            return syntaxNode.Parent switch
            {
                NamespaceDeclarationSyntax namespaceDeclarationSyntax => namespaceDeclarationSyntax.Name.ToString(),
                null => string.Empty,
                _ => GetNamespace(syntaxNode.Parent)
            };
        }

        internal static string GetTypeParameters(this INamedTypeSymbol namedTypeSymbol)
        {
            return namedTypeSymbol.TypeParameters.Length == 0 ? ""
                : $"<{namedTypeSymbol.TypeParameters.Select(x => x.Name).Aggregate((a, b) => $"{a}, {b}")}>";
        }

        internal static string GetConstraintClauses(this INamedTypeSymbol namedTypeSymbol)
        {
            if (namedTypeSymbol.TypeParameters.Length == 0) return "";
            var result = new List<string>();
            foreach (var item in namedTypeSymbol.TypeParameters)
            {
                var constraintType = item.ToDisplayString();
                var constraintItems = item.ConstraintTypes.Select(x => x.ToDisplayString()).Aggregate((a, b) => $"{a}, {b}").Trim();
                result.Add($"where {constraintType} : {constraintItems}".Trim());
            }

            return result.Aggregate((a, b) => $"{a} {b}").Trim();
        }

        internal static string GetBaseList(this INamedTypeSymbol namedTypeSymbol, params string[] others)
        {
            var result = new List<string>();
            if (namedTypeSymbol.BaseType != null && !string.Equals(namedTypeSymbol.BaseType.Name, "object", StringComparison.InvariantCultureIgnoreCase))
                result.Add(namedTypeSymbol.BaseType.Name);
            if (namedTypeSymbol.AllInterfaces.Length != 0)
            {
                foreach (var item in namedTypeSymbol.AllInterfaces)
                {
                    result.Add(item.Name);
                }
            }
            if (others != null && others.Length != 0)
            {
                foreach (var item in others)
                {
                    if (!string.IsNullOrEmpty(item))
                        result.Add(item);
                }
            }
            return result.Count == 0 ? "" : $": {result.Aggregate((a, b) => $"{a}, {b}")}".Trim();
        }

        private static string getKind(IParameterSymbol parameterSymbol)
        {
            return parameterSymbol.IsParams ? "params" : parameterSymbol.RefKind.ToStringValue();
        }

        private static string getDefaultValue(IParameterSymbol parameterSymbol)
        {
            if (parameterSymbol.HasExplicitDefaultValue)
            {
                if (parameterSymbol.ExplicitDefaultValue == null)
                    return $" = null";
                if (parameterSymbol.ExplicitDefaultValue is bool)
                    return $" = {parameterSymbol.ExplicitDefaultValue.ToString().ToLowerInvariant()}";
                if (parameterSymbol.ExplicitDefaultValue is string)
                    return $" = \"{parameterSymbol.ExplicitDefaultValue}\"";
                else
                    return $" = {parameterSymbol.ExplicitDefaultValue}";
            }
            return "";
        }

        private static string getConstraintClauses(ITypeParameterSymbol typeParameterSymbol)
        {
            if (typeParameterSymbol.ConstraintTypes.Length > 0)
            {
                var constraintType = typeParameterSymbol.ToDisplayString();
                var constraintItems = typeParameterSymbol.ConstraintTypes.Select(x => x.ToDisplayString()).Aggregate((a, b) => $"{a}, {b}").Trim();
                return $"where {constraintType} : {constraintItems}".Trim();
            }
            return "";
        }
        internal static string GetSignatureText(this IMethodSymbol methodSymbol)
        {

            var name = methodSymbol.Name;

            var parametersText = methodSymbol.Parameters.Length == 0 ? "()"
                : "(" + methodSymbol.Parameters.Select(x => getKind(x) + $" {x.Type} " + x.Name + getDefaultValue(x))
                                  .Aggregate((a, b) => a + ", " + b).Trim() + ")";

            var returnType = methodSymbol.ReturnsVoid ? "void" : methodSymbol.ReturnType.ToDisplayString();
            var typeParameters = methodSymbol.TypeParameters.Length == 0
                ? ""
                : "<" + methodSymbol.TypeParameters.Select(x => x.Name).Aggregate((a, b) => $"{a}, {b}").Trim() + ">";
            var constraintClauses = methodSymbol.TypeParameters.Length == 0
                ? ""
                : methodSymbol.TypeParameters.Select(x => getConstraintClauses(x)).Aggregate((a, b) => $"{a} {b}")
            ;

            return $"{returnType} {name}{typeParameters}{parametersText} {constraintClauses}".Trim();
        }

        internal static string GetCallableSignatureText(this IMethodSymbol methodSymbol)
        {
            var name = methodSymbol.Name;

            var parametersText = methodSymbol.Parameters.Length == 0 ? "()"
                : "(" + methodSymbol.Parameters.Select(x => $"{getKind(x)} {x.Name}")
                                  .Aggregate((a, b) => $"{a}, {b}").Trim() + ")";
            var typeParameters = methodSymbol.TypeParameters.Length == 0
                ? ""
                : "<" + methodSymbol.TypeParameters.Select(x => x.Name).Aggregate((a, b) => $"{a}, {b}").Trim() + ">";

            return $"{name}{typeParameters}{parametersText}".Trim();
        }
    }
}

// MockableGenerator.cs
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.Text;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace MockableStaticGenerator
{
    [Generator]
    public class MockableGenerator : ISourceGenerator
    {
        private static readonly List<string> _interfaces = new List<string>();
        private static readonly List<string> _classes = new List<string>();
        public class MethodSymbolVisitor : SymbolVisitor
        {
            private readonly string _typeName;

            public MethodSymbolVisitor(string typeName)
            {
                _typeName = typeName;
            }
            public override void VisitNamespace(INamespaceSymbol symbol)
            {
                foreach (var child in symbol.GetMembers())
                {
                    child.Accept(this);
                }
            }

            public override void VisitNamedType(INamedTypeSymbol symbol)
            {
                foreach (var child in symbol.GetMembers())
                {
                    child.Accept(this);
                }
            }

            public override void VisitMethod(IMethodSymbol symbol)
            {
                var cls = symbol.ReceiverType;
                var isClass = symbol.ReceiverType.TypeKind == TypeKind.Class;
                var isPublic = string.Equals(symbol.ReceiverType.DeclaredAccessibility.ToString().ToLowerInvariant(), "public", StringComparison.InvariantCultureIgnoreCase);
                if (isClass && isPublic && symbol.IsStatic && symbol.MethodKind == MethodKind.Ordinary)
                {
                    var className = cls.Name;
                    var classNameWithNs = cls.ToDisplayString();
                    if (classNameWithNs != _typeName) return;

                    var wrapperClassName = !className.Contains('<') ? className + "Wrapper" : className.Replace("<", "Wrapper<");
                    var classTypeParameters = ((INamedTypeSymbol)cls).GetTypeParameters();
                    var wrapperInterfaceName = $"I{wrapperClassName}{classTypeParameters}";
                    var constraintClauses = ((INamedTypeSymbol)cls).GetConstraintClauses();
                    var baseList = ((INamedTypeSymbol)cls).GetBaseList(wrapperInterfaceName);
                    var returnKeyword = symbol.ReturnsVoid ? "" : "return ";
                    var methodSignature = symbol.GetSignatureText();
                    var callableMethodSignature = symbol.GetCallableSignatureText();
                    var obsoleteAttribute = symbol.GetAttributes().FirstOrDefault(x => x.ToString().StartsWith("System.ObsoleteAttribute("))?.ToString();

                    var interfaceSource = $"\tpublic partial interface I{wrapperClassName}{classTypeParameters} {constraintClauses} {{";
                    var classSource = $"\tpublic partial class {wrapperClassName}{classTypeParameters} {baseList} {constraintClauses} {{";


                    if (!_interfaces.Contains(interfaceSource))
                        _interfaces.Add(interfaceSource);

                    if (!_classes.Contains(classSource))
                        _classes.Add(classSource);

                    if (!_interfaces.Contains(methodSignature))
                    {
                        _interfaces.Add($"\t\t{methodSignature};");
                    }

                    if (!_classes.Contains(methodSignature))
                    {
                        if (!string.IsNullOrEmpty(obsoleteAttribute))
                        {
                            _classes.Add($"\t\t[{obsoleteAttribute}]");
                        }
                        _classes.Add($"\t\tpublic {methodSignature} {{");
                        _classes.Add($"\t\t\t{returnKeyword}{classNameWithNs}.{callableMethodSignature};");
                        _classes.Add("\t\t}");
                    }
                }
            }
        }

        public void Execute(GeneratorExecutionContext context)
        {
            context.AddSource(nameof(Constants.MockableStaticAttribute), SourceText.From(Constants.MockableStaticAttribute, Encoding.UTF8));

            if (context.SyntaxReceiver is not SyntaxReceiver receiver)
                return;

            CSharpParseOptions options = (context.Compilation as CSharpCompilation).SyntaxTrees[0].Options as CSharpParseOptions;
            Compilation compilation = context.Compilation.AddSyntaxTrees(CSharpSyntaxTree.ParseText(SourceText.From(Constants.MockableStaticAttribute, Encoding.UTF8), options));
            INamedTypeSymbol attributeSymbol = compilation.GetTypeByMetadataName($"System.{nameof(Constants.MockableStaticAttribute)}");

            var sources = new StringBuilder();
            var assemblyName = "";
            foreach (var cls in receiver.Classes)
            {
                SemanticModel model = compilation.GetSemanticModel(cls.SyntaxTree);
                var clsSymbol = model.GetDeclaredSymbol(cls);

                var attr = clsSymbol.GetAttributes().FirstOrDefault(ad => ad.AttributeClass.Equals(attributeSymbol, SymbolEqualityComparer.Default));

                if (attr == null) continue;
                var isParameterlessCtor = attr?.ConstructorArguments.Length == 0;

                var sbInterface = new StringBuilder();
                var sbClass = new StringBuilder();

                if (isParameterlessCtor)
                {
                    var methods = cls.DescendantNodes().OfType<MethodDeclarationSyntax>().Where(x => x.IsPublic() && x.IsStatic()).ToList();
                    if (methods.Count == 0) continue;

                    var className = clsSymbol.Name;
                    var ns = string.IsNullOrEmpty(cls.GetNamespace()) ? "" : cls.GetNamespace() + ".";
                    var baseList = string.IsNullOrEmpty(cls.BaseList?.ToFullString()) ? ":" : cls.BaseList?.ToFullString().Trim() + ",";
                    assemblyName = clsSymbol.ContainingAssembly.Identity.Name;
                    var wrapperClassName = !className.Contains('<') ? className + "Wrapper" : className.Replace("<", "Wrapper<");
                    var classTypeParameters = cls.GetTypeParameters() ?? "";
                    var constraintClauses = cls.GetConstraintClauses() ?? "";
                    sbInterface.AppendLine($"\tpublic partial interface I{wrapperClassName}{classTypeParameters} {constraintClauses} {{");
                    sbClass.AppendLine($"\tpublic partial class {wrapperClassName}{classTypeParameters} {baseList} I{wrapperClassName}{classTypeParameters} {constraintClauses} {{");

                    foreach (MethodDeclarationSyntax method in methods)
                    {
                        var text = method.GetSignatureText();

                        if (!sbInterface.ToString().Contains(text))
                            sbInterface.AppendLine($"\t\t{text};");

                        if (!sbClass.ToString().Contains(text))
                        {
                            var returnKeyword = method.ReturnsVoid() ? "" : "return ";
                            var obsoleteAttrText = "";
                            var isObsolete = method.TryGetObsoleteAttribute(out obsoleteAttrText);
                            if (isObsolete)
                                sbClass.AppendLine($"\t\t{obsoleteAttrText}");

                            sbClass.AppendLine($"\t\tpublic {method.GetSignatureText()} {{");
                            sbClass.AppendLine($"\t\t\t{returnKeyword}{ns}{className}{classTypeParameters}.{method.GetCallableSignatureText()};");
                            sbClass.AppendLine($"\t\t}}");
                        }
                    }

                    sbInterface.AppendLine($"\t}}");
                    sbClass.AppendLine($"\t}}");
                }
                else
                {
                    var ctor = ((INamedTypeSymbol)attr?.ConstructorArguments[0].Value);
                    var assemblySymbol = ctor.ContainingAssembly.GlobalNamespace;
                    assemblyName = ctor.ContainingAssembly.Identity.Name;
                    var visitor = new MethodSymbolVisitor(ctor.ToDisplayString());
                    visitor.Visit(assemblySymbol);
                    sbInterface.AppendLine(_interfaces.Aggregate((a, b) => a + Environment.NewLine + b) + Environment.NewLine + "\t}");
                    sbClass.AppendLine(_classes.Aggregate((a, b) => a + Environment.NewLine + b) + Environment.NewLine + "\t}");
                }

                var interfaceWrapper = sbInterface.ToString();
                var classWrapper = sbClass.ToString();

                sources.AppendLine(interfaceWrapper);
                sources.AppendLine(classWrapper);
            }

            var defaultUsings = new StringBuilder();
            defaultUsings.AppendLine("using System;");
            defaultUsings.AppendLine("using System.Collections.Generic;");
            defaultUsings.AppendLine("using System.Linq;");
            defaultUsings.AppendLine("using System.Text;");
            defaultUsings.AppendLine("using System.Threading.Tasks;");
            var usings = defaultUsings.ToString();

            var src = sources.ToString();
            var @namespace = new StringBuilder();
            @namespace.AppendLine(usings);
            @namespace.AppendLine($"namespace {assemblyName}.MockableGenerated {{");
            @namespace.AppendLine(src);
            @namespace.Append("}");
            var result = @namespace.ToString();

            context.AddSource($"{assemblyName}MockableGenerated", SourceText.From(result, Encoding.UTF8));
        }

        public void Initialize(GeneratorInitializationContext context)
        {
            // System.Diagnostics.Debugger.Launch();
            context.RegisterForSyntaxNotifications(() => new SyntaxReceiver());
        }
    }
}
```

![](/images/the-dotnet-world-csharp-source-generator/generated.png)

## Visual Studio does not detect my source generators, What should I do?

Unfortunately, the current version of Visual Studio (16.8.2) has a lot of problems while you are using code generators, but you can try the following steps.

0. Make sure you follow the steps above correctly.
1. Use `dotnet clean`, Maybe you need to delete all `bin` and `obj` folders.
2. After that, use `dotnet build` to make sure your source code has no error and the problem is caused by Visual Studio.
3. Reset your Visual Studio.

## How to debug it?

To start debug you can add `System.Diagnostics.Debugger.Launch();` as following:

```cs
public void Initialize(GeneratorInitializationContext context)
{
    System.Diagnostics.Debugger.Launch(); // HERE
    context.RegisterForSyntaxNotifications(() => new SyntaxReceiver());
}
```

Run the debugger and you will see it stops at `System.Diagnostics.Debugger.Launch()` line.

![](/images/the-dotnet-world-csharp-source-generator/debugger1.png)

![](/images/the-dotnet-world-csharp-source-generator/debugger2.png)

![](/images/the-dotnet-world-csharp-source-generator/debugger3.png)

If you have any problem for debugging, like what I had before

![](/images/the-dotnet-world-csharp-source-generator/managed.png)

Make sure you are running Visual Studio as administrator.

**Open Visual Studio as Administrator**

If you want to start Visual Studio as Administrator you can do the following:

* Right-click on your VS task bar shortcut
* Right-click on your VS product and select Properties
* From Properties window select Advanced…
* From Advanced Properties check on Run as Administrator option
* select Ok in Advanced Properties window, Apply and then Ok on VS 2019 Properties.

![](/images/the-dotnet-world-csharp-source-generator/vs1.png)

**Open every Visual Studio Solution (.sln) as Administrator**

Although not the best idea if you open third-party VS solutions, it may come in handy if you need to open the same solutions as Administrator again and again. To do so, right-click on `devenv.exe` and select `Troubleshoot Compatibility`.

![](/images/the-dotnet-world-csharp-source-generator/vs2.png)

You may then proceed to the following steps:

* On the Program Compatibility Troubleshooter window, click on Troubleshoot Program
* Check The program requires additional permissions and click Next
* On the next window, click on Test the program… and VS will open as administrator
* Click next and then click on Yes, save these settings for this program

![](/images/the-dotnet-world-csharp-source-generator/vs3.png)

Following the above, whenever you open a solution (.sln) it will always open as Adminsitrator. If you want to disable this function, you will need to follow again the steps above without checking though The Program requires additional permissions.

## How to work with files?

If you are using a specific physical file with source generators you **should** use `AdditionalFiles` in your `csproj`.

```xml
<ItemGroup>
    <AdditionalFiles Include="People.csv" CsvLoadType="Startup" />
    <AdditionalFiles Include="Cars.csv" CsvLoadType="OnDemand" CacheObjects="true" />
</ItemGroup>
```

To access your attributes like `CsvLoadType` or `CacheObjects`, You are able to use the following approach:

```cs
static IEnumerable<(CsvLoadType, bool, AdditionalText)> GetLoadOptions(SourceGeneratorContext context)
{
    foreach (AdditionalText file in context.AdditionalFiles)
    {
        if (Path.GetExtension(file.Path).Equals(".csv", StringComparison.OrdinalIgnoreCase))
        {
            // HERE
            context.AnalyzerConfigOptions.GetOptions(file)
                .TryGetValue("build_metadata.additionalfiles.CsvLoadType", out string? loadTimeString);
            Enum.TryParse(loadTimeString, ignoreCase: true, out CsvLoadType loadType);

            context.AnalyzerConfigOptions.GetOptions(file)
                .TryGetValue("build_metadata.additionalfiles.CacheObjects", out string? cacheObjectsString);
            bool.TryParse(cacheObjectsString, out bool cacheObjects);

            yield return (loadType, cacheObjects, file);
        }
    }
}
```

## How to publish it through Nuget?

To do this you have two important xml blocks in your `csproj` as folowing.

```xml
<PropertyGroup>
  <IncludeBuildOutput>false</IncludeBuildOutput>
</PropertyGroup>

<ItemGroup>
  <None Include="$(OutputPath)\$(AssemblyName).dll" Pack="true" PackagePath="analyzers/dotnet/cs" Visible="false" />
</ItemGroup>
```

![](/images/the-dotnet-world-csharp-source-generator/nuget.png)

## Source Code

You can check the source of this project and its nuget package from the following addresses:

[GitHub](https://github.com/HamedFathi/MockableStaticGenerator)

[Nuget](https://www.nuget.org/packages/MockableStaticGenerator)

## Reference(s)

Some of the information in this article has gathered from various references.

* https://makolyte.com/how-to-mock-static-methods/
* https://devblogs.microsoft.com/dotnet/introducing-c-source-generators/
* https://devblogs.microsoft.com/dotnet/new-c-source-generator-samples/
* https://github.com/dotnet/roslyn/blob/master/docs/features/source-generators.cookbook.md
* https://ppolyzos.com/2017/08/08/always-run-visual-studio-as-administrator/