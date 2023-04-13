# Lab 2

The goal of this lab is to improve the TODO app from the previous lab by adding a database.

After, we will dockerize the app.

## Docker

### Install Docker

To install docker, you can follow the instructions [here](https://docs.docker.com/get-docker/)

Check that docker is installed by running the following command:

```bash
docker run hello-world
```

### Docker image

Let's create a docker image for our app.
To do so, we will create a ne file: `Dockerfile`

```dockerfile
# Base image from https://hub.docker.com/_/openjdk
FROM openjdk:17-jdk-alpine

# Copy the jar file to the container
COPY target/todo-0.0.1-SNAPSHOT.jar /app/todo.jar

# Expose the port 8080
EXPOSE 8080

# Run the jar file
CMD ["java", "-jar", "/app/todo.jar"]
```

Make sure your project is built using: `mvn clean install`

You can now build the docker image.

```bash
docker build -t todo .
```

Finally, you can run the docker image using:

```bash
docker run -p 8080:8080 --load todo
```

You can use access it like before: http://localhost:8080.

You could use this docker image to deploy your app on any server, hosting service or cloud provider!

## Accessing the database from the app

Spring Data JPA is very well documented as well: https://docs.spring.io/spring-data/jpa/docs/current/reference/html/#reference

### Install mysql

If you have docker, you can use the following command to install mysql

```bash
docker run --name mysql -e MYSQL_ROOT_PASSWORD=myPassword -p 3306:3306 -d mysql
```

If you don't have docker, you must install mysql on your computer. You can find the installation instructions [here](https://dev.mysql.com/doc/mysql-installation-excerpt/5.7/en/)

Once mysql is installed, you can test it's working by connecting to it using the following command:

```bash
mysql -h 127.0.0.1 -u root -p
```

### Add Spring Data

You need to add the new dependencies to the pom.xml. We could also have added them in spring initializr when generating the project.

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>
```

### Configure the database

We need to tell Spring Data where the database is and how to connect to it.

To do so, we will configure the database in the resources/application.properties file.

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/mysql
spring.datasource.username=root
spring.datasource.password=myPassword
spring.jpa.hibernate.ddl-auto=create-drop
#spring.jpa.show-sql: true # Uncomment to see the SQL queries
```

You can now run the app, it should work properly.

### Transform Todo class into an Entity

To use the database, we need to transform the Todo class into an Entity.

We can use the following annotation to do so:

```java
@Entity
public class Todo {
    @Id
    @GeneratedValue
    private Integer id;
    private String title;
    private String description;
    private boolean done;
}
```

Beware that the id is now an Integer and not an int. This is because the id can be null when the object is not yet saved in the database.

### Create a repository

To access our data from the service layer, we need to create a repository.

```java
@Repository
public interface TodoRepository extends CrudRepository<Todo, Integer> {
}
```

With this interface, Spring Data will create a class that implements all the methods of the interface automatically.
Most of the time, you will not need to implement the interface yourself. Spring Data will do it for you!

### Use the repository in TodoService

Let's use the repository in the TodoService. We will start with only the getAll method.

```java
public class TodoService {
    @Autowired
    private TodoRepository repository;

    public List<Todo> getAll() {
        return repository.findAll();
    }
}
```

Run the app, you can see that the database and the table are created.

If you call the getAll method, you will see that the list is empty. This is because we have not added any data to the database.

Let's add some data to the database by updating our create method.

```java
public Todo create(Todo todo) {
    return repository.save(todo);
}
```

You can add a todo using postman or curl.

```bash
curl -X POST -H "Content-Type: application/json" -d '{"title":"My title", "description":"My description", "done":false}' http://localhost:8080/todos
```

When you call the getAll method, you will see that the todo you just created is returned!

For the rest of the methods, you can use the same technique. Check the interface to see which methods are available.

### Testing

It works well, but now all our tests are broken because we are using the database.

Let's fix by writing proper tests.

You will need to add this line in the test/resources/application.properties file. It disables the database so we can test properly without the database.

```properties
spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration, org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration, org.springframework.boot.autoconfigure.jdbc.DataSourceTransactionManagerAutoConfiguration
```

#### Integration tests

First we can update our controller tests to mock the service layer.

```java
public class TodoControllerTest {
    @MockBean
    private TodoService service;

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void testGetAll() throws Exception {
        List<Todo> expected = List.of(new Todo(1, "title", "description", false));
        when(todoService.getAllTodos()).thenReturn(expected);

        this.mockMvc.perform(get("/todos"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(MockMvcResultMatchers.content().contentType("application/json"))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].title").value("title"))
                .andExpect(jsonPath("$[0].description").value("description"))
                .andExpect(jsonPath("$[0].done").value(false));
    }

    [...]
}
```

We added the `@MockBean` annotation to mock the service layer. it will create a mock of the service and inject it in the controller.

Using the `when` method, we can tell the mock to return a specific value when a specific method is called.

In this way we are testing the controller in isolation. We are not testing any business logic, only the controller with HTTP status codes and JSON responses.

Using this technique, implement the rest of the controller tests.

Some mockito methods you might need:

- `when`: to tell the mock to return a specific value when a specific method is called.
- `any`: inside the `when` method, you can use `any` to tell the mock to return a specific value when a method is called with any parameter. For example: `when(todoService.updateTodoById(eq(1), any())).thenReturn(expected);`
- `eq`: You cannot mix `any` and a specific value. If you want to use both, you need to use `eq` to specify the value. See the example above.

#### Service tests

We can also test the service layer in isolation. To do so, we can mock the repository.

Here is an example of a test for the getAll method.

```java
@SpringBootTest
public class TodoServiceTest {
    @MockBean
    private TodoRepository repository;

    private TodoService service;

    @BeforeEach
    public void setup() {
        service = new TodoService(repository);
    }

    @Test
    public void testGetAll() {
        // Given
        List<Todo> expected = List.of(new Todo(1, "title", "description", false));
        when(repository.findAll()).thenReturn(expected);

        // When
        List<Todo> actual = service.getAll();

        // Then
        assertEquals(expected, actual);
    }

    [...]
}
```

Theses tests are more interesting because they test the business logic of the service.
You can test the other methods in the same way.

You can even start testing cases where the repository returns an empty list or null. To check if the edge cases are handled properly.

## Connected Four

![Connect Four](https://upload.wikimedia.org/wikipedia/commons/a/ad/Connect_Four.gif)

Let's now start (or improve) the connected four game using a database.

I provide a frontend so you play in the browser and connect it to your API. You can see how you can use it in the next section.

Here is a recap of the rules:

- 2 players
- The board is 2D with 7 columns and 6 rows
- The players take turns to play
- Each turn, a player has to drop a piece in a column. It will fall to the bottom of the column
- The goal is to align 4 pieces of the same color in a row, column or diagonal

You can reuse the knowledge you have from the previous labs to create controllers, services and repositories.
Tests will help you to make sure that everything works as expected.

I can think of a lot of features that you can add to the game thanks to the database:

- Handling multiple games at the same time
- Have an history of all the games played
- Save the game and continue it later
- Have a leaderboard
- Play against another player (multiplayer)
- Play against the computer

### Using the frontend
