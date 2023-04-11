---
marp: true
class: invert
paginate: true
---

# Who am I?

[**Adrien Baudhuin**](https://fr.linkedin.com/in/adrien-baudhuin-3505b6b1/en)
mail: adrien+uni[at]baudhuin.fr

Software Engineer at [**AODocs**](https://www.aodocs.com/)

All resources are available on [**GitHub**](https://github.com/abaudhuin/spring-class)

---

# What are we going to learn?

- What is Spring
- Create a Spring Boot app
- Create REST API with Spring
- In next class: Connection to a database

---

# Pre-requisites for this class

- Java
- Maven
- HTTP ([Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/verview))
- REST API ([Documentation](https://restfulapi.net/))

---

![bg left:40% 80%](images/spring.png)

# **How to Spring**

---

### First came [JEE](https://fr.wikipedia.org/wiki/Jakarta_EE) (Java Enterprise Edition)

- Set of standards to build enterprise applications.
- A lot of libraries to solve common problems.

Quite old (1999) and not much used anymore.

---

### Then came Spring

- A web framework to build web applications.
- Follows most of the JEE standards.
- Fixes modularity issues of JEE.
- Used everywhere (Netflix, Amazon, etc.)

![bg right:30% 80%](images/spring.png)

---

### More recently

New frameworks, specialized in different areas (microservices, serverless, etc.)

Most notable in the Java ecosystem:

- Micronaut
- Quarkus

---

## Spring Web Framework

- A standardized structure.
- Highly configurable and customizable
- A set of libraries to solve common problems
  - Spring Web MVC (Create HTTP APIs)
  - Spring Data (Connect to Databases)
  - Spring Security (Secure and authenticate users)
  - Spring Cloud (Connect to Cloud Providers)

---

## Spring Boot

- Spring is complex and hard to setup because of its flexibility.
- Spring boot is a preconfigured Spring application
- Easy to start a new project

![bg right:40% 80%](images/spring-boot.png)

---

# Creating a Spring Boot app

[Spring Initializer](https://start.spring.io/)

<!-- Detail configuration, file structure, run the application -->

---

## Multi-Layer Architecture ([Wikipedia](https://en.wikipedia.org/wiki/Multitier_architecture))

> A multi-tier architecture is a client–server architecture in which presentation, application processing, and data management functions are physically separated.

Often, we have 3 layers:

- Controllers (Presentation)
- Services (Business logic)
- Repositories (Data)

---

## Inversion of Control ([Wikipedia](https://en.wikipedia.org/wiki/Inversion_of_control))

> The application is in charge of creating all the objects it needs.

---

## Dependency Injection ([Wikipedia](https://en.wikipedia.org/wiki/Dependency_injection))

> The application injects the dependencies each component needs.

---

## Aspect Oriented Programming ([Wikipedia](https://en.wikipedia.org/wiki/Aspect-oriented_programming))

> Allows to add cross-cutting behaviours to an application without modifying the code.

---

# First HTTP endpoint

- Create a controller
- Create a endpoint method
- Annotations
- Serialization

---

# First service

- Create a service
- Adding logic
- Inject in the controller

---

# Testing

- Unit testing Sercices
- Integration testing Controllers

---

# Production

<!-- Build a jar, run as standalone -->

---

# Lab

- Create a TODO app
- Multiple endpoints CRUD
- A service with business logic
- Tests
