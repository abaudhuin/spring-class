# Lab 1: Spring Boot basics

The goal of this lab is to create a simple todo app using Spring Boot.

At the end of this lab, we will implement a little game using Spring Boot.

At any moment you can check the official documentation: https://docs.spring.io/spring-boot/docs/current/reference/html/web.html#web
It's a very good documentation and it's easy to find what you are looking for. It covers all the topics we will see today and a lot more.

## Create a new project

Let's start by creating a new Spring Boot project.

- Go to https://start.spring.io/
- Select Maven
- Keep the default group and artifact
- Keep the default Java version (?)
- Add the following dependencies:
  - Spring Web
- Click on Generate

You can now Unzip the generated project.
It is now ready to be imported in your favorite IDE.
To run the project, you can use the following command:

```bash
mvn spring-boot:run
```

Open your browser and go to http://localhost:8080.
You should see a simple message saying "Whitelabel Error Page". It means that the project is running but there is no endpoint configured.

You officially have a Spring Boot project running !

## The first controller

Let's create our first controller with our first endpoint.

```java
@RestController
public class TodoController {
    @GetMapping("/")
    public String hello() {
        return "Hello World";
    }
}
```

Let's break it down:
`@RestController` tells spring that this class is a HTTP controller
`@GetMapping("/")` tells spring that this method is a HTTP endpoint waiting for a GET request on the root path
We return a string that will be sent as a response.

Run the project again, you should see the string in the browser !

You have just created your first HTTP endpoint with Spring !

## Todo App

For the rest of the lab, we will create a todo application.
The goal of this application is to be able to create, read, update and delete todos.

First we need to define what a todo is.
A Todo is a simple class with a few fields:

- `int id`
  - The id of the todo
- `String title`
  - The title of the todo
- `String description`
  - The description of the todo
- `boolean done`
  - If the todo is done or not

Create this class in the exisiting package.

```java
public class Todo {
    private int id;
    private String title;
    private String description;
    private boolean done;

    public Todo(int id, String title, String description, boolean done) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.done = done;
    }

    [Getters and Setters]
}
```

### Get all todos endpoint

We will start by creating an endpoint that will return a list of todos.
We can reuse the class we just created to create a new endpoint.

The new method looks like this:

```java
@GetMapping("/todos")
public List<Todo> getAllTodos() {
    return List.of(new Todo(1, "title", "description", false));
}
```

Let's break it down:

- `@GetMapping("/todos")` will tell spring that this method is a HTTP endpoint waiting for a GET request on the path `/todos`
- The return type of the method will be `List<Todo>` - By default Spring will serialize this list to JSON
- For now we return a list with a single todo

You can also use `@ResponseBody` to tell spring to serialize the return value to JSON

You can now run the project and check that the endpoint is working by going to http://localhost:8080/todos.
It should return a JSON array with a single todo!

#### Testing

Let's write a simple test to make sure the endpoint is working as expected.
We will use JUnit, Spring Test and MockMvc to test our endpoint.

Let's look at the code first:

```java
@SpringBootTest
@AutoConfigureMockMvc
public class TodoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void getAllTodos() throws Exception {
        this.mockMvc.perform(get("/todos"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(MockMvcResultMatchers.content().contentType("application/json"))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].title").value("title"))
                .andExpect(jsonPath("$[0].description").value("description"))
                .andExpect(jsonPath("$[0].done").value(false));
    }
}
```

Let's break it down:

- `@SpringBootTest` tells spring to load the application context
- `@AutoConfigureMockMvc` tells spring to create a MockMvc instance
  MockMvc is a class that will allow us to test the endpoints without starting the server
- `@Autowired` tells spring to inject the MockMvc instance in the test class
- `this.mockMvc.perform(get("/todos"))` will call the endpoint `/todos` with a GET request
- `andDo(print())` will print the result of the request to help debugging
- `andExpect(status().isOk())` will check that the HTTP return code is 200 (default code configured in Spring)
- `andExpect(MockMvcResultMatchers.content().contentType("application/json"))` will check that the content type of the response is JSON
- The next lines check that the content of the response is what is expected. We use JSONPath to check the content of the response. You can for more information about JSONPath here:

If you run the test, it should pass!

### Get todo by id endpoint

Now that we have a working endpoint, let's add the next one: `GET /todos/{id}`

The code for this method is very similar to the previous one.

```java
@GetMapping("/todos/{id}")
public Todo getTodoById(@PathVariable int id) {
    return new Todo(1, "title", "description", false);
}
```

Let's see what's new:

- `@GetMapping("/todos/{id}")` will tell spring that this method is a HTTP endpoint waiting for a GET request on the path `/todos/{id}`
- The `{id}` part is a path variable. It will be replaced by the value of the path variable with the same name. The `@PathVariable` annotation tells spring to inject the value of the path variable in the method parameter.

You can add a test for this endpoint now, it should be very similar to the previous one.

### Create a new todo endpoint

Now that we can get todos, let's add the next endpoint: `POST /todos`

For this one let's do the test first:

```java
@Test
public void createTodo() throws Exception {
    this.mockMvc.perform(post("/todos").content("{\"id\":1,\"title\":\"title\",\"description\":\"description\",\"done\":false}").contentType("application/json"))
            .andDo(print())
            .andExpect(status().isCreated())
            .andExpect(MockMvcResultMatchers.content().contentType("application/json"))
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.title").value("title"))
            .andExpect(jsonPath("$.description").value("description"))
            .andExpect(jsonPath("$.done").value(false));
}
```

Now you can implement the endpoint by yourself. that makes the test pass.

The annotation for a POST request is `@PostMapping`. The HTTP return code is 201 (Created) and the body of the request will contain the todo to create.
Spring will automatically deserialize the body of the request to a `Todo` object and inject it in the method parameter.

This method will return a `ResponseEntity<Todo>` with the created todo. You can use the Constructor `ResponseEntity(Todo body, HttpStatus status)` to set the HTTP return code.

### Todo service

Now that we have the first the endpoints we need, let's create a service to perform the business logic of the application.
We will use a simple ArrayList to store the todos for now.

It looks like this:

```java
@Component
public class TodoService {
    private List<Todo> todos = new ArrayList<>();


    public TodoService() {
        todos = new ArrayList<>(List.of(new Todo(1, "title", "description", false)));
    }

    [...]
}
```

The `@Component` annotation tells spring that this class is a component that can be injected in other classes.

You can inject the service in the controller and use it to manipulate the data.

```java
@RestController
public class TodoController {
    @Autowired
    private TodoService todoService;

    public TodoController(TodoService todoService) {
        this.todoService = todoService;
    }

    [...]
}
```

The `@Autowired` annotation tells spring to inject the service in the controller.
It will look for a component that implements the `TodoService` interface and inject it.
It's not necessary to use the `@Autowired`, if you don't use it, spring will inject the service automatically.
Let's keep it for now to make things clear.

Create the 3 service methods that interacts with the ArrayList and use them in the endpoints you created earlier.

You shouldn't have to change anything in the tests to keep them green.

### Rest of the endpoints

Now you should be able to create the rest of the endpoints by yourself. We will be adding 2 more.

List of all the endpoints:

- GET /todos
  - Return a list of todos
- GET /todos/{id}
  - Return a single todo
- POST /todos
  - Create a new todo
- PUT /todos/{id}
  - Update a todo
- DELETE /todos/{id}
  - Delete a todo

To implement this, you will have to add aditional logic to the service.

Don't forget to add tests for the new endpoints.

#### Tests independance

It's possible that you encounter a problem with your new tests. It's because the tests are not independent from each other.

The reason is that if a test is run after the PUT test, it will fail because the list of todos has been modified.

To fix this we need to re-initialize the list of todos in the service before each test.

```java
@BeforeEach
public void init() {
    todoService.init();
}
```

The `init()` method simply reset the state of the todo list.

It's a simplistic solution for now. We will introduce a more robust solution for this next time.

### Conclusion

You should now have a working API that can be used to manage todos!

## Connect Four

Now that you know all the basics of Spring, let's create a small game to put everything we learned into practice.

We will be creating a Connect Four game!

The rules are simple:
- 2 players
- The board is 2D with 7 columns and 6 rows
- The players take turns to play
- Each turn, a player has to drop a piece in a column. It will fall to the bottom of the column
- The goal is to align 4 pieces of the same color in a row, column or diagonal

![Connect Four](https://upload.wikimedia.org/wikipedia/commons/a/ad/Connect_Four.gif)

For now, let's start with managing a single game and store it's state in memory.
The API should be simple, with a few endpoints. One to get the current state of the game and one to play a move.

You will have to create a service that implement the logic of the game. It will have to store the state of the game, the current player, etc. 

I encourage you to use the tests to guide you in the implementation of the service and test the logic of the game.
