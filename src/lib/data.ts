export const personalInfo = {
  name: "Hamed Fathi",
  location: "Vienna, Austria",
  github: "https://github.com/HamedFathi",
  linkedin: "https://www.linkedin.com/in/hamedfathi/",
  youtube: "https://www.youtube.com/@HamedFathiTech"
};

export const workExperience = [
  {
    company: "SoFresh IT Solutions (RINGANA GmbH)",
    location: "Vienna, Austria",
    position: "Senior Full Stack Engineer",
    period: "Dec 2021 - Present",
    achievements: [
      "Modernization & Cloud Migration: Played a key role for migrating a large, complex legacy CRM (C++ and WPF applications) to an Azure solution built using Domain-Driven Design (DDD) and cloud-native services. Resulted in a 30% improvement in system response times, an average of 60% faster delivery of new features from start to market and a 75% reduction in bugs reported post-release.",
      "Front-end Development: Designed modern, responsive CRM web pages from Figma prototypes, delivering high-performance and user-friendly interfaces.",
      "Framework Implementation: Developed and deployed a DDD framework across many applications in the company to help all .NET teams deliver applications faster and reliably.",
      "AI Integration: Led and engineered an AI Python-based engine using a LLM and LangChain, fully integrated with Azure OpenAI services and increased the productivity of the customer and support team by 60%.",
      "Testing & Quality Assurance: Created and maintained unit, integration, and end-to-end (E2E) tests accounted for more than 90% coverage of the code.",
      "DevOps & IaC Initiatives: Authored Infrastructure as Code (IaC) beginning in ARM templates, then Pulumi, and ultimately, Bicep as the new native approach for new Azure projects, overseeing and managing app delivery end-to-end to guarantee deployments were consistent and reliable.",
      "Agile Team Collaboration: Participated in all aspects of our cross-functional Agile team with the Product Owner (PO) to plan sprints, prioritize and refine the backlog, collect requirements, design technical solutions, and peer code review.",
    ],
  },
  {
    company: "Iranian National Tax Administration (INTA)",
    location: "Tehran, Iran",
    position: "Senior Full Stack Engineer",
    period: "Feb 2014 - Aug 2021",
    achievements: [
      "MIS Application: Led a team of developers in designing and optimizing a web-based Management Information System (MIS), promoting coding best practices and conducting regular code reviews. Troubleshot and resolved complex technical issues during development, ensuring system reliability and supporting data-driven decision-making across the organization.",
      "Tax Digitization: Played a pivotal role in a nationwide tax digitization initiative, delivering a comprehensive end-to-end tax solution designed to handle all possible scenarios. The application modernized tax services across the entire country, significantly enhancing accessibility and operational efficiency.",
      "Anti-Money Laundering: Designed and implemented a anti-money laundering system to detect suspicious transactions, strengthening financial security and compliance."
    ],
  },
  {
    company: "Behpardaz Jahan",
    location: "Tehran, Iran",
    position: "Full Stack Developer",
    period: "Feb 2012 - May 2013",
    achievements: [
      "E-Care Application: Implemented key frontend and backend functionalities for the Mobin Net E-Care project, which enhanced customer care processes for Iran’s largest WiMAX ISP. The application was designed with jQuery, Bootstrap, WCF, and ASP.NET Web Forms, providing a comprehensive nationwide solution to manage all customer needs effectively.",
    ],
  },
];

export const education = [
  {
    institution: "Azad University Tehran Central Branch (IAUCTB)",
    location: "Tehran, Iran",
    degree: "MSc Computer Software Engineering",
    period: "Sep 2019",
    achievements: []
  },
];
export const skills = {
  programmingLanguages: [
    "C#",
    "JavaScript",
    "TypeScript",
    "Python",
    "SQL",
  ],
  frontendDevelopment: [
    "Blazor",
    "Angular",
    "Vue",
    "Pinia",
    "Quasar UI Framework",
    "Figma",
    "HTML",
    "CSS",
  ],
  backendDevelopment: [
    ".NET Core",
    "ASP.NET Core (MVC, Web API, Minimal APIs)",
    "Entity Framework Core (EF Core)",
    "SignalR",
    "GraphQL",
    "gRPC",
  ],
  cloudAndDevOps: [
    "Microsoft Azure",
    "Azure Functions",
    "Azure Logic Apps",
    "Azure Service Bus",
    "Azure Cosmos DB",
    "Azure Container Registry",
    "Azure OpenAI",
    "Azure DevOps (CI/CD)",
    "Pulumi (IaC)",
    "Microsoft Bicep",
    "Docker",
    "Git",
  ],
  architectureAndPractices: [
    "Domain-Driven Design (DDD)",
    "Command Query Responsibility Segregation (CQRS)",
    "Test-Driven Development (TDD)",
    "Behavior-Driven Development (BDD)",
    "Event Sourcing",
    "Microservices",
    "Modular Monolithic Architecture",
    "REST APIs",
    "SOLID Principles",
  ],
  aiAndMachineLearning: [
    "LLMs",
    "LangChain",
    "Azure OpenAI",
    "Semantic Kernel",
  ],
  testingAndQuality: [
    "Unit Testing",
    "Integration Testing",
    "E2E Testing (Cypress, Playwright)",
    "Jest",
    "Postman",
    "K6",
  ],
  dataAndDatabases: [
    "SQL Server",
    "Redis",
    "Azure Cosmos DB",
  ],
  programmingParadigms: [
    "Object-Oriented Programming (OOP)",
    "Functional Programming",
    "Metaprogramming",
  ],
  methodologiesAndManagement: [
    "Agile",
    "Scrum",
    "Kanban",
    "Jira",
    "Confluence",
  ],
};


export const projects = [
  {
    title: "RecursiveTextSplitter",
    github: "https://github.com/HamedFathi/RecursiveTextSplitter",
    description: [
      "A C# library that provides intelligent text splitting functionality with semantic awareness. Unlike simple character-based splitting, this library attempts to preserve meaningful boundaries by using a hierarchical approach to text segmentation, from paragraph breaks down to character-level splitting as a last resort.",
    ],
  },
  {
    title: "TrxFileParser",
    github: "https://github.com/HamedFathi/TrxFileParser",
    description: [
      "A Trx file is nothing but a Visual Studio unit test result file extension. This file is in XML format. TrxFileParser helps you to parse it.",
    ],
  },
  {
    title: "dotnet-extract",
    github: "https://github.com/HamedFathi/dotnet-extract",
    description: [
      "A .NET global tool to extract embedded resource files from a .NET assembly.",
    ],
  },
  {
    title: "Replay",
    github: "https://github.com/HamedFathi/Replay",
    description: [
      "A Visual Studio Code extension for auto typing.",
    ],
  },
  {
    title: "PasswordMeter",
    github: "https://github.com/HamedFathi/PasswordMeter",
    description: [
      "This password meter is based on a point system. Its main goal is to help the end-user with a stronger password.",
    ],
  },
  {
    title: "SimMetricsCore",
    github: "https://github.com/HamedFathi/SimMetricsCore",
    description: [
      "A text similarity metric library, e.g. from edit distance's (Levenshtein, Gotoh, Jaro, etc) to other metrics, (e.g Soundex, Chapman). This library is compiled based on the .NET standard with a lot of useful extension methods.",
    ],
  },
  ,
  {
    title: "PostmanCollectionReader",
    github: "https://github.com/HamedFathi/SimMetricsCore",
    description: [
      "Postman is an API platform for building and using APIs. Postman simplifies each step of the API lifecycle and streamlines collaboration so you can create better APIs—faster. This library helps you to read a Postman Collection v2.1 json file in C#.",
    ],
  },
  {
    title: "MockableStaticGenerator",
    github: "https://github.com/HamedFathi/MockableStaticGenerator",
    description: [
      "A C# source generator to make an interface and a class wrapper to test static and extension methods.",
    ],
  },
  {
    title: "EnumerationClassGenerator",
    github: "https://github.com/HamedFathi/EnumerationClassGenerator",
    description: [
      "A C# source generator to create an enumeration class from an enum type.",
    ],
  },
];

/*
export const awards = [
  {
    name: "IEEE YESIST12 Hackathon",
    issuer: "IEEE",
    date: "Sep 2022",
    type: "International",
    position: "Second Place",
  },
  {
    name: "Prodigi Cognizant Hackathon",
    issuer: "Cognizant",
    date: "Feb 2023",
    type: "National",
    position: "Second Runner-up",
  },
  {
    name: "Cisco Thingqbator Hackathon",
    issuer: "Cisco",
    date: "Jan 2023",
    type: "National",
    position: "First Runner-up",
  },
  {
    name: "Innovators Day",
    issuer: "Sri Manakula Vinayagar Engineering College, Pondicherry",
    date: "Sep 2022",
    type: "National",
    position: "First Prize",
  },
  {
    name: "KG Hackfest'22",
    issuer: "KGiSL Institute of Technology, Coimbatore",
    date: "Sep 2022",
    type: "National",
    position: "Second Prize",
  },
  {
    name: "Innohacks'22",
    issuer: "Innogeeks, KIET Group of Institutions, New Delhi",
    date: "May 2022",
    type: "National",
    position: "Second Runner-up",
  },
  {
    name: "Hack @ SKCET",
    issuer: "Hackclub SKCET, SKCET, Coimbatore",
    date: "Feb 2022",
    type: "National",
    position: "Most Impactful Hack",
  },
];
*/