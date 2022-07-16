---
title: A Professional ASP.NET Core API - RabbitMQ
date: October 23 2020
category: aspnetcore-api
tags:
    - dotnet
    - aspnetcore
    - webapi
    - masstransit
    - rabbitmq
    - easynetq
    - amqp
    - queue
    - messagebroker
---
 
`RabbitMQ` is an open-source message-broker software that originally implemented the Advanced Message Queuing Protocol (AMQP) and has since been extended with a plug-in architecture to support Streaming Text Oriented Messaging Protocol, MQ Telemetry Transport, and other protocols.

A `message broker` acts as a `middleman` for various services (e.g. a web application, as in this example). They can be used to reduce loads and delivery times of web application servers by delegating tasks that would normally take up a lot of time or resources to a third party that has no other job.

<!-- more -->

![](/images/a-professional-asp.net-core-api-rabbitmq/1.png)

A `message` can include any kind of information. It could, for example, have information about a process or task that should start on another application (which could even be on another server), or it could be just a simple text message. The queue-manager software stores the messages until a receiving application connects and takes a message off the queue. The receiving application then processes the message.

When the user has entered user information into the web interface, the web application will create a "PDF processing" message that includes all of the important information the user needs into a message and place it onto a queue defined in `RabbitMQ`.

![](/images/a-professional-asp.net-core-api-rabbitmq/2.png)

The basic architecture of a message queue is simple - there are client applications called `producers` that create messages and deliver them to the broker (the message queue). Other applications, called `consumers`, connect to the queue and `subscribe` to the messages to be processed. Software may act as a producer, or consumer, or both a consumer and a producer of messages. Messages placed onto the queue are stored until the consumer retrieves them.

## When and why should you use RabbitMQ?

Message queueing allows web servers to respond to requests quickly instead of being forced to perform resource-heavy procedures on the spot that may delay response time. Message queueing is also good when you want to distribute a message to multiple consumers or to balance loads between workers.

The consumer takes a message off the queue and starts processing the PDF. At the same time, the producer is queueing up new messages. The consumer can be on a totally different server than the producer or they can be located on the same server. The request can be created in one programming language and handled in another programming language. The point is, the two applications will only communicate through the messages they are sending to each other, which means the sender and receiver have `low coupling`.

![](/images/a-professional-asp.net-core-api-rabbitmq/3.png)

1. The user sends a PDF creation request to the web application.
2. The web application (the producer) sends a message to RabbitMQ that includes data from the request such as name and email.
3. An exchange accepts the messages from the producer and routes them to correct message queues for PDF creation.
4. The PDF processing worker (the consumer) receives the task message and starts processing the PDF.

## Exchanges

Messages are not published directly to a queue; instead, the producer sends messages to an exchange. An exchange is responsible for `routing` the messages to different queues with the help of bindings and routing keys.

![](/images/a-professional-asp.net-core-api-rabbitmq/4.png)

* **Binding** is a `link` that you set up to bind a queue to an exchange (A link between a queue and an exchange).
* **Routing key** is a message attribute the exchange looks at when deciding how to route the message to queues (depending on exchange type).

Exchanges, connections, and queues can be configured with parameters such as durable, temporary, and auto delete upon creation. Durable exchanges survive server restarts and last until they are explicitly deleted. Temporary exchanges exist until RabbitMQ is shut down. Auto-deleted exchanges are removed once the last bound object is unbound from the exchange.

In RabbitMQ, there are four different types of exchanges that route the message differently using different parameters and bindings setups. Clients can create their own exchanges or use the predefined default exchanges which are created when the server starts for the first time.

**Message flow in RabbitMQ**

1. The producer publishes a message to an exchange. When creating an exchange, the type must be specified. This topic will be covered later on.
2. The exchange receives the message and is now responsible for routing the message. The exchange takes different message attributes into account, such as the routing key, depending on the exchange type.
3. Bindings must be created from the exchange to queues. In this case, there are two bindings to two different queues from the exchange. The exchange routes the message into the queues depending on message attributes.
4. The messages stay in the queue until they are handled by a consumer
5. The consumer handles the message.

**Types of exchanges**

![](/images/a-professional-asp.net-core-api-rabbitmq/5.png)

* **Direct**: The message is routed to the queues whose binding key exactly matches the routing key of the message. For example, if the queue is bound to the exchange with the binding key pdfprocess, a message published to the exchange with a routing key pdfprocess is routed to that queue.

* **Fanout**: A fanout exchange routes messages to all of the queues bound to it.

* **Topic**: The topic exchange does a wildcard match between the routing key and the routing pattern specified in the binding.

* **Headers**: Headers exchanges use the message header attributes for routing.

## Direct Exchange

A direct exchange delivers messages to queues based on a message routing key. The routing key is a message attribute added to the message header by the producer. Think of the routing key as an "address" that the exchange is using to decide how to route the message. `A message goes to the queue(s) with the binding key that exactly matches the routing key of the message`.

The direct exchange type is useful to distinguish messages published to the same exchange using a simple string identifier.

The default exchange AMQP brokers must provide for the direct exchange is "amq.direct".

Imagine that queue A (create_pdf_queue) in the image below (Direct Exchange Figure) is bound to a direct exchange (pdf_events) with the binding key pdf_create. When a new message with routing key pdf_create arrives at the direct exchange, the exchange routes it to the queue where the binding_key = routing_key, in the case to queue A (create_pdf_queue).

![](/images/a-professional-asp.net-core-api-rabbitmq/direct-exchange.png)

**Scenario 1**

* Exchange: pdf_events
* Queue A: create_pdf_queue
* Binding key between exchange (pdf_events) and Queue A (create_pdf_queue): pdf_create

**Scenario 2**

* Exchange: pdf_events
* Queue B: pdf_log_queue
* Binding key between exchange (pdf_events) and Queue B (pdf_log_queue): pdf_log

**Example**

A message with routing key pdf_log is sent to the exchange pdf_events. The messages is routed to pdf_log_queue because the routing key (pdf_log) matches the binding key (pdf_log).

If the message routing key does not match any binding key, the message is discarded.

**Default Exchange**

The default exchange is a pre-declared `direct exchange with no name`, usually referred by an empty string. When you use default exchange, your message is delivered to the queue with a name equal to the routing key of the message. Every queue is automatically bound to the default exchange with a routing key which is the same as the queue name.

## Topic Exchange

Topic exchanges route messages to queues based on wildcard matches between the routing key and the routing pattern, which is specified by the queue binding. Messages are routed to one or many queues based on a matching between a message routing key and this pattern.

The routing key must be a list of words, delimited by a period (.). Examples are agreements.us and agreements.eu.stockholm which in this case identifies agreements that are set up for a company with offices in lots of different locations. The routing patterns may contain an asterisk (“*”) to match a word in a specific position of the routing key (e.g., a routing pattern of "agreements.*.*.b.*" only match routing keys where the first word is "agreements" and the fourth word is "b"). A pound symbol (“#”) indicates a match of zero or more words (e.g., a routing pattern of "agreements.eu.berlin.#" matches any routing keys beginning with "agreements.eu.berlin").

The consumers indicate which topics they are interested in (like subscribing to a feed for an individual tag). The consumer creates a queue and sets up a binding with a given routing pattern to the exchange. All messages with a routing key that match the routing pattern are routed to the queue and stay there until the consumer consumes the message.

The default exchange AMQP brokers must provide for the topic exchange is "amq.topic".

![](/images/a-professional-asp.net-core-api-rabbitmq/topic-exchange.png)

**Scenario 1**

The image to the right shows an example where consumer A is interested in all the agreements in Berlin.

* Exchange: agreements
* Queue A: berlin_agreements
* Routing pattern between exchange (agreements) and Queue A (berlin_agreements): agreements.eu.berlin.#
* Example of message routing key that matches: agreements.eu.berlin and agreements.eu.berlin.headstore

**Scenario 2**

Consumer B is interested in all the agreements.

* Exchange: agreements
* Queue B: all_agreements
* Routing pattern between exchange (agreements) and Queue B (all_agreements): agreements.#
* Example of message routing key that matches: agreements.eu.berlin and agreements.us

**Scenario 3**

Consumer C is interested in all agreements for European head stores.

* Exchange: agreements
* Queue C: headstore_agreements
* Routing pattern between exchange (agreements) and Queue C (headstore_agreements): agreements.eu.*.headstore
* Example of message routing keys that will match: agreements.eu.berlin.headstore and agreements.eu.stockholm.headstore

**Example**

A message with routing key agreements.eu.berlin is sent to the exchange agreements. The messages are routed to the queue berlin_agreements because the routing pattern of "agreements.eu.berlin.#" matches the routing keys beginning with "agreements.eu.berlin". The message is also routed to the queue all_agreements because the routing key (agreements.eu.berlin) matches the routing pattern (agreements.#).

## Fanout Exchange

A fanout exchange copies and routes a received message to all queues that are bound to it regardless of routing keys or pattern matching as with direct and topic exchanges. The keys provided will simply be ignored.

Fanout exchanges can be useful when the same message needs to be sent to one or more queues with consumers who may process the same message in different ways.

The image to the right (Fanout Exchange) shows an example where a message received by the exchange is copied and routed to all three queues bound to the exchange. It could be sport or weather updates that should be sent out to each connected mobile device when something happens, for instance.

The default exchange AMQP brokers must provide for the topic exchange is "amq.fanout".

![](/images/a-professional-asp.net-core-api-rabbitmq/fanout-exchange.png)

**Scenario 1**

* Exchange: sport_news
* Queue A: Mobile client queue A
* Binding: Binding between the exchange (sport_news) and Queue A (Mobile cli
ent queue A)

**Example**

A message is sent to the exchange sport_news. The message is routed to all queues (Queue A, Queue B, Queue C) because all queues are bound to the exchange. Provided routing keys are ignored.

## Headers Exchange

A headers exchange routes messages based on arguments containing headers and optional values. Headers exchanges are very similar to topic exchanges, but route messages based on header values instead of routing keys. A message matches if the value of the header equals the value specified upon binding.

A special argument named "x-match", added in the binding between exchange and queue, specifies if all headers must match or just one. Either any common header between the message and the binding count as a match, or all the headers referenced in the binding need to be present in the message for it to match. The "x-match" property can have two different values: "any" or "all", where "all" is the default value. A value of "all" means all header pairs (key, value) must match, while value of "any" means at least one of the header pairs must match. Headers can be constructed using a wider range of data types, integer or hash for example, instead of a string. The headers exchange type (used with the binding argument "any") is useful for directing messages which contain a subset of known (unordered) criteria.

The default exchange AMQP brokers must provide for the topic exchange is "amq.headers".

![](/images/a-professional-asp.net-core-api-rabbitmq/headers-exchange.png)

**Example**

* Exchange: Binding to Queue A with arguments (key = value): format = pdf, type = report, x-match = all
* Exchange: Binding to Queue B with arguments (key = value): format = pdf, type = log, x-match = any
* Exchange: Binding to Queue C with arguments (key = value): format = zip, type = report, x-match = all

**Scenario 1**

Message 1 is published to the exchange with header arguments (key = value): "format = pdf", "type = report".

Message 1 is delivered to Queue A because all key/value pairs match, and Queue B since "format = pdf" is a match (binding rule set to "x-match =any").

**Scenario 2**

Message 2 is published to the exchange with header arguments of (key = value): "format = pdf".

Message 2 is only delivered to Queue B. Because the binding of Queue A requires both "format = pdf" and "type = report" while Queue B is configured to match any key-value pair (x-match = any) as long as either "format = pdf" or "type = log" is present.

**Scenario 3**

Message 3 is published to the exchange with header arguments of (key = value): "format = zip", "type = log".

Message 3 is delivered to Queue B since its binding indicates that it accepts messages with the key-value pair "type = log", it doesn't mind that "format = zip" since "x-match = any".

Queue C doesn't receive any of the messages since its binding is configured to match all of the headers ("x-match = all") with "format = zip", "type = pdf". No message in this example lives up to these criterias.

It's worth noting that in a header exchange, the actual order of the key-value pairs in the message is irrelevant.

## Dead Letter Exchange

If no matching queue can be found for the message, the message is silently dropped. RabbitMQ provides an AMQP extension known as the "Dead Letter Exchange", which provides the functionality to capture messages that are not deliverable.

## RabbitMQ concepts at a glance

| Concept | Description |
|---------|-------------|
|Producer| Application that sends the messages.|
|Consumer| Application that receives the messages.|
|Queue| Buffer that stores messages.|
|Message| Information that is sent from the producer to a consumer through RabbitMQ.|
|Connection| A TCP connection between your application and the RabbitMQ broker.|
|Channel| A virtual connection inside a connection. When publishing or consuming messages from a queue - it's all done over a channel.|
|Exchange| Receives messages from producers and pushes them to queues depending on rules defined by the exchange type. To receive messages, a queue needs to be bound to at least one exchange.|
|Binding| A binding is a link between a queue and an exchange.|
|Routing key| A key that the exchange looks at to decide how to route the message to queues. Think of the routing key like an address for the message.|
|AMQP| Advanced Message Queuing Protocol is the protocol used by RabbitMQ for messaging.|
|Users| Users can be added from the management interface and every user can be assigned permissions such as rights to read, write and configure privileges. Users can also be assigned permissions to specific virtual hosts.
|Vhost, virtual host| Virtual hosts provide a way to segregate applications using the same RabbitMQ instance. Different users can have different access privileges to different vhost and queues and exchanges can be created so they only exist in one vhost.
|Cluster| A cluster consists of a set of connected computers that work together. If the RabbitMQ instance consisting of more than one node - it is called a RabbitMQ cluster. A cluster is a group of nodes i.e., a group of computers.
|Node| A node is a single computer in the RabbitMQ cluster.

## RabbitMQ installation (Windows)

**Install Erlang/OTP**

`RabbitMQ` requires a 64-bit supported version of [Erlang](https://www.erlang.org/downloads) for Windows to be installed. 

Set `ERLANG_HOME` to where you actually put your Erlang installation, e.g. `C:\Program Files\erl{version}` (full path). The RabbitMQ batch files expect to execute `%ERLANG_HOME%\bin\erl.exe`.

Go to `Start > Settings > Control Panel > System > Advanced > Environment Variables`. Create the system environment variable `ERLANG_HOME` and set it to the full path of the directory which contains `bin\erl.exe`.

**Install RabbitMQ Server**

After making sure a supported Erlang version is installed, download [RabbitMQ server](https://github.com/rabbitmq/rabbitmq-server/releases).

**Enable RabbitMQ Management Plugin**

Go to the directory where the `RabbitMQ` is installed.

Now, enable the `rabbitmq_management` plugin using the `rabbitmq-plugins` command as shown below.

```bash
sbin/rabbitmq-plugins enable rabbitmq_management
```

The `rabbitmq_management` plugin is a combination of the following plugins. All of the following plugins will be enabled when you execute the above command:

* mochiweb
* webmachine
* rabbitmq_web_dispatch
* amqp_client
* rabbitmq_management_agent
* rabbitmq_management

After enabling the `rabbitmq_management` plugin you should restart the RabbitMQ server as shown below.

```bash
sbin/rabbitmqctl stop

sbin/rabbitmq-server -detached
```

And we'll get an output like this:

```
Warning: PID file not written; -detached was passed.
```

**Login to RabbitMQ Management Dashboard**

RabbitMQ Management is a plugin that we enabled for RabbitMQ in previous section. It gives a single static HTML page that makes background queries to the HTTP API for RabbitMQ. Information from the management interface can be useful when you are debugging your applications or when you need an overview of the whole system. If you see that the number of unacked messages starts to get high, it could mean that your consumers are getting slow. If you need to check if an exchange is working, you can try to send a test message.

By default the management plugin runs on `15672` HTTP port.

From your browser go to `http://localhost:15672`

The default username and password for RabbitMQ management plugin is: `guest`

![](/images/a-professional-asp.net-core-api-rabbitmq/dashboard.png)

## RabbitMQ Management Dashboard

The RabbitMQ Management is a user-friendly interface that let you monitor and handle your RabbitMQ server from a web browser. Among other things queues, connections, channels, exchanges, users and user permissions can be handled - created, deleted and listed in the browser. You can monitor message rates and send/receive messages manually.

## Overview tab

The overview shows two charts, one for queued messages and one with the message rate. You can change the time interval shown in the chart by pressing the text (chart: last minute) above the charts. Information about all different statuses for messages can be found by pressing (?).

![](/images/a-professional-asp.net-core-api-rabbitmq/rabbitmq-mngmt-overview.png)

**Queued messages**

A chart of the total number of queued messages for all your queues. Ready show the number of messages that are available to be delivered. Unacked are the number of messages for which the server is waiting for acknowledgment.

**Messages rate**

A chart with the rate of how the messages are handled. Publish show the rate at which messages are entering the server and Confirm show a rate at which the server is confirming.

**Global Count**

The total number of connections, channels, exchanges, queues and consumers for ALL virtual hosts the current user has access to.

**Nodes**

Nodes show information about the different nodes in the RabbitMQ cluster (a cluster is a group of nodes i.e, a group of computers), or information about one single node if just one node is used. Here can information about server memory, number of erlang processes per node and other node-specific information be found. Info show i.e. further information about the node and enabled plugins.

![](/images/a-professional-asp.net-core-api-rabbitmq/management-node.png)

**Port and contexts**

Listening ports for different protocols can be found here. More information about the protocols will be found in a later part of RabbitMQ for beginners.

![](/images/a-professional-asp.net-core-api-rabbitmq/port-and-contexts.png)

**Import export definitions**

It is possible to import and export configuration definitions. When you download the definitions, you get a JSON representation of your broker (your RabbitMQ settings). This can be used to restore exchanges, queues, virtual hosts, policies, and users. This feature can be used as a backup. Every time you make a change in the config, you can keep the old settings just in case.

![](/images/a-professional-asp.net-core-api-rabbitmq/import-export-definitions.png)

## Connections and Channels tabs

A connection is a TCP connection between your application and the RabbitMQ broker. A channel is a virtual connection inside a connection.

RabbitMQ connections and channels can be in different **states**; starting, tuning, opening, running, flow, blocking, blocked, closing, closed. If a connection enters flow-control this often means that the client is being rate-limited in some way.

**Connections**

The connection tab shows the connections established to the RabbitMQ server. **vhost** shows in which vhost the connection operates, the **username** the user associated with the connection. **Channels** tell the number of channels using the connection. **SSL/TLS** indicate whether the connection is secured with SSL.

![](/images/a-professional-asp.net-core-api-rabbitmq/connections.png)

If you click on one of the connections, you get an overview of that specific connection. You can view channels in the connection and data rates. You can see client properties and you can close the connection.

![](/images/a-professional-asp.net-core-api-rabbitmq/connection-info.png)

**Channels**

The channel tab show information about all current channels. The **vhost** shows in which vhost the channel operates, the **username** the user associated with the channel. The **mode** tells the channel guarantee mode. It can be in confirm or transactional mode. When a channel is in confirm mode, both the broker and the client count messages. The broker then confirms messages as it handles them. Confirm mode is activated once the confirm.select method is used on a channel.

![](/images/a-professional-asp.net-core-api-rabbitmq/channels.png)

If you click on one of the channels, you get a detailed overview of that specific channel. From here you can see the message rate on the number of logical consumers retrieving messages via the channel.

![](/images/a-professional-asp.net-core-api-rabbitmq/channel-info.png)

## Exchanges tab

An exchange receives messages from producers and pushes them to queues. The exchange must know exactly what to do with a message it receives. All exchanges can be listed from the exchange tab. **Virtual host** shows the vhost for the exchange, **type** is the exchange type such as direct, topic, headers, fanout. **Features** show the parameters for the exchange (e.g. D stand for durable, and AD for auto-delete). Features and types can be specified when the exchange is created. In this list there are some amq.* exchanges and the default (unnamed) exchange. These are created by default.

![](/images/a-professional-asp.net-core-api-rabbitmq/exchanges.png)

By clicking on the exchange name, a detailed page about the exchange are shown. You can see and add bindings to the exchange. You can also publish a message to the exchange or delete the exchange.

![](/images/a-professional-asp.net-core-api-rabbitmq/exchange-info.png)

## Queues tab

The queue tab show the queues for all or one selected vhost.

![](/images/a-professional-asp.net-core-api-rabbitmq/queues.png)

Queues have different parameters and arguments depending on how they were created. The features column show the parameters that belong to the queue. It could be features like Durable queue (which ensure that RabbitMQ will never lose the queue), Message TTL (which tells how long a message published to a queue can live before it is discarded), Auto expire (which tells how long a queue can be unused for before it is automatically deleted), Max length (which tells how many (ready) messages a queue can contain before it starts to drop them) and Max length bytes (which tells the total body size for ready messages a queue can contain before it starts to drop them).

You can also create a queue from this view.

If you press on any chosen queue from the list of queues, all information about the queue are shown like in the pictures that follow below.

![](/images/a-professional-asp.net-core-api-rabbitmq/queues-2.png)

The first two charts include the same information as the overview, but it just shows the number of queued messages and the message rates for that specific queue.

**Consumers**

Consumers show the consumers/channels that are connected to the queue.

![](/images/a-professional-asp.net-core-api-rabbitmq/queues-7.png)

**Bindings**

A binding can be created between an exchange and a queue. All active bindings to the queue are shown under bindings. You can also create a new binding to a queue from here or unbind a queue from an exchange.

![](/images/a-professional-asp.net-core-api-rabbitmq/queues-5.png)

**Publish message**

It is possible to manually publish a message to the queue from "publish message". The message will be published to the default exchange with the queue name as given routing key - meaning that the message will be sent to the queue. It is also possible to publish a message to an exchange from the exchange view.

![](/images/a-professional-asp.net-core-api-rabbitmq/queues-4.png)

**Get message**

It is possible to manually inspect the message in the queue. "Get message" get the message to you and if you mark it as "requeue", RabbitMQ puts it back to the queue in the same order.

![](/images/a-professional-asp.net-core-api-rabbitmq/queues-6.png)

**Delete or Purge queue**

A queue can be deleted by the delete button, and you can empty the queue by pressing purge.

![](/images/a-professional-asp.net-core-api-rabbitmq/queues-3.png)

## Admin tab

From the Admin view, it is possible to add users and change user permissions. You can set up vhosts, policies, federation, and shovels.

![](/images/a-professional-asp.net-core-api-rabbitmq/admin-add-user.png)

![](/images/a-professional-asp.net-core-api-rabbitmq/admin-add-vhost.png)

## UI Example

This example shows how you can create a queue "example-queue" and an exchange called example.exchange.

Queue view: Add queue

![](/images/a-professional-asp.net-core-api-rabbitmq/add-queue.png)

Exchange view: Add exchange

![](/images/a-professional-asp.net-core-api-rabbitmq/add-exchange.png)

The exchange and the queue are connected by a binding called "pdfprocess". Messages published to the exchange with the routing key "pdfprocess" will end up in the queue.

Press on the exchange or on the queue go to "Add binding from this exchange" or "Add binding to this queue".

![](/images/a-professional-asp.net-core-api-rabbitmq/add-binding.png)

Publish a message to the exchange with the routing key "pdfprocess"

![](/images/a-professional-asp.net-core-api-rabbitmq/publish-message.png)

Queue overview for example-queue when a message is published.

![](/images/a-professional-asp.net-core-api-rabbitmq/publish.png)

A lot of things can be viewed and handled from the management interface and it will give you a good overview of your system. By looking into the management interface, you will get a good understanding about RabbitMQ and how everything is related.

## EasyNetQ



## MassTransit

A free, open-source distributed application framework for .NET.

Install the below packages

```bash
Install-Package MassTransit -Version 7.0.6
dotnet add package MassTransit --version 7.0.6
<PackageReference Include="MassTransit" Version="7.0.6" />

Install-Package MassTransit.AspNetCore -Version 7.0.6
dotnet add package MassTransit.AspNetCore --version 7.0.6
<PackageReference Include="MassTransit.AspNetCore" Version="7.0.6" />

Install-Package MassTransit.RabbitMQ -Version 7.0.6
dotnet add package MassTransit.RabbitMQ --version 7.0.6
<PackageReference Include="MassTransit.RabbitMQ" Version="7.0.6" />
```

## Reference(s)

Most of the information in this article has gathered from various references.

* https://www.cloudamqp.com/blog/2015-05-18-part1-rabbitmq-for-beginners-what-is-rabbitmq.html
* https://www.cloudamqp.com/blog/2015-05-27-part3-rabbitmq-for-beginners_the-management-interface.html
* https://www.cloudamqp.com/blog/2015-09-03-part4-rabbitmq-for-beginners-exchanges-routing-keys-bindings.html
* https://www.codewithmukesh.com/blog/rabbitmq-with-aspnet-core-microservice/
* https://alvinvafana.blogspot.com/2019/10/messaging-through-service-bus-using.html
* https://www.rabbitmq.com/install-windows-manual.html
* https://www.thegeekstuff.com/2013/10/enable-rabbitmq-management-plugin/
* https://www.codementor.io/@bosunbolawa/how-to-enable-rabbitmq-management-interface-owc5lzg7f
* https://doumer.me/micro-services-communication-rabbitmq-and-asp-net-core/
* https://www.tutlane.com/tutorial/rabbitmq