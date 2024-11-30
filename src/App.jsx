import { useEffect, useState } from "react";
import Logo from "./components/Logo";
import Search from "./components/Search";
import NumResults from "./components/NumResults";
import NavBar from "./components/NavBar";
import Main from "./components/Main";
import Box from "./components/Box";
import MovieList from "./components/MovieList";
import MovieDetails from "./components/MovieDetails";
import Loader from "./components/Loader";
import ErrorMessage from "./components/ErrorMessage";
import WatchedMoviesList from "./components/WatchedMovieList";
import WatchedSummary from "./components/WatchedSummary";

//define it here and take it out of the render logic
const apiKey = process.env.REACT_APP_API_KEY;

if (!apiKey) {
  console.error(
    "API key is missing. Please set REACT_APP_API_KEY in your environment variables."
  );
}

export default function App() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  // instead of passing in a value for useState, we can pass in a callback function
  // INITIALIZE THE STATE with whatever the callback function returns

  const [watched, setWatched] = useState(function () {
    const storedValue = localStorage.getItem("watched");
    return storedValue ? JSON.parse(storedValue) : [];
  });

  //event handler function that we pass down to child componenent to update the state in the parent
  function handleSelectMovie(id) {
    setSelectedId((selectedId) => (id === selectedId ? null : id));
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }
  // when updating the state, make sure to never mutate the original array
  // updating state based on current state
  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);

    // localStorage.setItem("watched", JSON.stringify([...watched, movie]));
  }

  // when updating the state, make sure to never mutate the original array
  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  // synchronized the watched state wit the local storage
  useEffect(
    function () {
      localStorage.setItem("watched", JSON.stringify(watched));
    },
    [watched]
  );

  // empty dependency array means side effect will render only once on mount
  useEffect(
    function () {
      // AbortController() is a browser API
      const controller = new AbortController();
      async function fetchMovies() {
        try {
          setIsLoading(true);
          // reset the error message before we start fetching for data from the movie api
          setError("");
          const response = await fetch(
            `http://www.omdbapi.com/?apikey=${apiKey}&s=${query}`,
            { signal: controller.signal }
          );
          if (!response.ok)
            throw new Error("Something went wrong while fetching movies");
          const data = await response.json();
          if (data.Response === "False") {
            throw new Error("Movie not found");
          }
          setMovies(data.Search);
          setError("");
        } catch (err) {
          // display error message only if it's not a network Abort error which is not an actual error
          if (err.name !== "AbortError") {
            setError(err.message);
          }
        } finally {
          setIsLoading(false);
        }
      }
      // if no search result , don't display the error message
      if (!query.length) {
        setMovies([]);
        setError("");
        return;
      }

      handleCloseMovie();
      fetchMovies();

      // clean up function
      return function () {
        controller.abort();
      };
    },
    [query]
  );

  return (
    <>
      <NavBar>
        <Logo />
        <Search query1={query} setQuery1={setQuery} />
        <NumResults movies={movies} />
      </NavBar>
      <Main>
        {/* Passing Elements as Props (Alternative to children) */}
        {/* <Box element={<MovieList movies={movies} />} /> */}

        <Box>
          {/* {isLoading ? <Loader /> : <MovieList movies={movies} />} */}
          {/* conditionally rendering , mutually exclusive , only one holds true at any given time */}
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList movies={movies} onSelectMovie={handleSelectMovie} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>
        {/* <Box
          element={
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList watched={watched} />
            </>
          }
        /> */}
        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatched}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList
                watched={watched}
                onDeleteWatched={handleDeleteWatched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

//! 107. How to Split a UI Into Components
//todo The 4 criteria for splitting a UI into components
/*

1. The component should create a logical separation of the content , or even layout of the page 

Does the component  contain pieces of content or layout that don't belong together 



2. The components should be reusable 

Is it possible to reuse part of the component ?
Do you want or need to reuse it ?



3. Each component should have a single well-defined responsibility 

Is the component doing too many different things ?
Does the component rely on too many props ?
Does the component have way too many pieces of state and / or effects 
Is the JSX way too complex ? 




4. Personal Coding Style , some people prefer working with larger components ,some people prefer smaller components 



Framework : When creating a new component 
Suggestion : When in doubt , start with a relatively bigger component then split it into smaller components as it becomes necessary 



*/

//* General Guidelines
/*
Be aware that creating a new component creates a new abstraction. Abstractions have a cost , because more abstractions require
more mental energy to switch back and forth between components . So try not to create components too early 

Name a component according to what it does or what it displays. Don't be afraid of using long component names 

Never declare a new component inside another component 

Co-locate related components inside the same file . Don't separate components into different files too early 

It's completely normal that an application has components of many different sizes , including very small and huge ones 





*/

//? 109. Component Categories

/*

Most of your components will naturally fall into one of three categories 

1) Stateless / Presentational Components 

These components don't have their own state and don't have any lifecycle methods. They are simply functions that render UI.
No state 
Can receive props and simply present received data or other content 
Usually small and reusable 


2) Stateful Components
Have state 
Can still be reusable 




3) Structural Components
Pages / Layouts / Screens of the app 
Result of composing many smaller components together 
Can be huge or non-reusable 


*/

//! Props Drilling
/*
So basically prop drilling means

that we need to pass some prop

through several nested child components

in order to get that data into the  deeply nested child component

*/

//todo Component Composition

//! When you use a component inside another component , you cannot reuse that parent component ( reusability is gone)

//? However with component composition , we pass another component into a component using the children prop
//* This makes the component reusable

// Component Composition is the technique of combining different components together using the children prop

// With component composition , we can
// 1) Create highly reusable and flexible components
// 2) Address the issue of prop drilling

// All of this is possible because components do not need to know their children in advance , which allows us to leave these empty slots
// in the form of the children prop

//! Component (instance) lifecycle
/*

Well, the LIFECYCLE of a COMPONENT basically encompasses

the different phases that a specific COMPONENT INSTANCE

can go through over time.


And the first phase in any COMPONENT'S LIFECYCLE

is that a COMPONENT INSTANCE is MOUNTED. Which is also called the INITIAL RENDER.

- Component instance is rendered for the first time 

- Fresh state and props are created 

- The application re-renders when the state changed 

- The specific componenent instance re-renders when 
1) State changes
2) Prop changes 
3) Parent Component re-renders
4) Context changes 


When a component is no longer needed --> Unmounted (the end of the lifecycle of the component)
- Component instance is destroyed and removed 
- State and props are destroyed 


Well, it's important to know about the COMPONENT LIFECYCLE,

because we can hook into different phases of this LIFECYCLE.

So we can basically define code to be executed at these specific points in time, which can be extremely useful.

And we do so by using the useEffect Hook,







*/

//! How not to fetch data in react

/*




this data fetching that we're doing right here is actually

introducing a side effect into the component's render logic.

So it is clearly an interaction with the outside world,

which should never be allowed in render logic.

So again, all this code that is here

at the top level of the function is of course

code that will run as the component first mounts

and therefore it is called render logic.

And so again, here we should have no side effects.

*/

/*


Fetching data in the render logic (or directly within the component's body without proper safeguards) can indeed create an infinite loop of state updates and re-renders in React. 

The Problem
Render Logic: The component renders and executes the fetch function.
Fetch Updates State: The fetch function updates a state variable with the fetched data.
State Change Triggers Re-render: React detects the state change and re-renders the component.
Repeat: During the re-render, the fetch function is called again, leading to another state update, which triggers another re-render... and so on.




*/

//! useEffect

/*

Now, the idea of the useEffect hook is to give us a place

where we can safely write side effects like this one.

Just, again, like our data fetching.

But the side effects registered with the useEffect hook

will only be executed after certain renders.

For example, only write after the initial render,

which is exactly what we are looking for in this situation.


Now, the use effect doesn't return anything

so we don't store the result into any variable,

but instead we pass in a function as the first argument , 

the second argument will be the dependency array 


So we used the useEffect hook to register an effect.

And so that effect is this function right here,

which contains the side effect that we want to register.

And basically, register means that we want this code here

not to run as the component renders,

but actually after it has been painted onto the screen.

And so that's exactly what useEffect does.

So while before, the code was executed

while the component was rendering,

so while the function was being executed,

now this effect will actually be executed after render.

And so that's a lot better.

Then, as a second argument,

we passed this empty array here into useEffect.

And so this means that this effect will only be executed

as the component first mounts.






*/

//! A first look at Effects
/*

Side effect means any interaction between React Component and the world outside React 

we can create side effects in two different places in React.

the first one is inside event handlers.

And remember that event handlers are simply

functions that are triggered whenever the event

that they are listening to happens.

However, simply reacting to events is sometimes not enough

for what an application needs.

Instead, in some situations, we need to

write some code that will be executed automatically

as the component renders.

And so this is when we can create a so-called effect

by using the useEffect hook.

So by creating an effect

we can basically write code that will run

at different moments of a component instance life cycle.

So when the component mounts, when it re-renders,

or even when it unmounts.



*/

// Event Handlers vs UseEffect hook
// 1) Use event handlers to handle side effects when you want to execute the side effect for a specific event that happens in the UI
// 2) Use the useEffect hook when you want to execute side effects after the component mounts(initial render) and after subsequent re-renders (according to dependency array)
// The useEffect hook also has the clean up function which is a function that will be called before the component re-renders or unmounts
// The main reason for the useEffect hook is to keep the component synchronized with the external system

// Event handlers are always to preferred way to create side effects

// IN react strict mode , side effects are run twice , react will call our side effects twice but only in development

/*

Although useEffect is deferred until after the browser has painted,
it’s guaranteed to fire before any new renders.
React will always flush a previous render’s effects before starting a new update.

React update 1: render virtual DOM, schedule effects, update DOM
Call useLayoutEffect
Update state, schedule re-render
Call useEffect
React update 2
Call useLayoutEffect from update 2
React releases control, browser paints the new DOM
Call useEffect from update 2

*/

//! Handling Errors when data fetching

//! Dependency Array
// useEffect is a synchronization mechanism
// By default , effects run after every render , we can prevent that by passing in the second argument to the useEffect hook : the dependency array
// Without the dependency array , react doesn't know when to run the effect
// Each time one of the dependencies change , the effect will be executed again
// Every state variable and prop used inside the effect must be included in the dependency array
// If the state variable and prop used inside the effect is not included , it will result in stale closure

// useEffect is like an event listener that is listening for one dependency to change
// Whenever a dependency changes , it will execute the effect again

// Effect react to updates to state and props used inside the effect (the dependencies) . So effects are re-active ( like states re-rendering the UI)

// Effects and lifecycle are deeply connected because when an effect is executed again , the component re-renders

//todo When are effects executed ?
// 1. Initial rendering (mounting the component instance )
// 2. The result of rendering is committed to the DOM
// 3. The DOM changes are painted onto the screen by the browser
//! 4. USE EFFECT ONLY EXECUTED AFTER THE BROWSER HAS PAINTED THE COMPONENT INSTANCE ON THE SCREEN , EFFECTS RUN ASYNC
//*  THE REASON WHY THIS HAPPENS IS BECAUSE DATA FETCHING MAY BE A LONG-RUNNING PROCESS , SO IF EFFECTS ARE EXECUTED BEFORE THE BROWSER PAINTS THE SCREEN , EFFECTS MIGHT BLOCK THE ENTIRE RENDERING PROCESS
//? BETWEEN THE COMMIT PHASE AND THE BROWSER PAINT , THERE IS ANOTHER TYPE OF EFFECT CALLED THE LAYOUT EFFECT

// 1. Initial Rendering
// 2. Commit phase
// 3. Browser Paint
// 4. Effect

// 5. title Changes
//6. re-render
//7. commit phase
//8. layout-effect
//9. Browser Paint
//10. Clean up
//11. Effect

//12. Unmount
//13. Clean up

//todo The cleanup function is a function that we can return from an effect (optional)
//todo runs on two occasions
//todo  1) Before the effect is executed , in order to clean up the effects of the previous side effects ,
//todo 2)  it also runs right after the component instance has unmounted , in order to give us the opportunity to reset the side effect that we created

// Effect (HTTP Request) --> Cleanup (Cancel Request)
// API Subscription --> Cancel Subscription
// Start Timer --> Stop Timer
// Add event listener --> Remove event listener

//? Race Condition Problem in React
/*


A race condition in React occurs when two or more asynchronous operations (e.g., API calls, state updates) are initiated, but their outcomes depend on the order of completion, which can lead to unexpected or incorrect behavior. 
This is particularly problematic when components re-render based on stale or outdated data.



How Race Conditions Occur in React

Race conditions often happen when:
Fetching data: A component makes multiple asynchronous requests (e.g., due to state changes), but the result of a slower request overwrites the result of a faster one.
Component unmounts: An asynchronous operation completes after the component has been unmounted, potentially trying to update state on an unmounted component, leading to warnings or errors.

Fixing Race Conditions
1. Aborting Outdated Requests
Use the AbortController to cancel outdated API requests.

2. Track Active Requests: Use a flag to ensure only the latest request's result updates the state.

3. Debounce Input: Reduce the frequency of API calls by waiting for user input to stabilize.

4. Centralize State Management: Use tools like Redux or React Query for better control over asynchronous state.
*/

//! React Hook and their rules

// React Hooks are essentially special functions that are built into react which allow us to basically hook into some of React's internal mechanism
// Hooks are basically API's that expose some internal react functionality , such as creating and accessing state from the fiber tree
// Registering side effects in the fiber tree
// Manual Dom selections

/*

And in fact, we can even create our own so-called

custom hooks, which will also start with the word "use."

And this is actually one of the greatest things

about hooks in general, because custom hooks

give us developers an easy way of reusing non-visual logic.

So logic that is not about the UI.

*/

//todo The rules of hooks
// 1) Only call hooks at the top level

//2) Only call hooks from react function

//! persist the watch list in local storage.
/*
So right now, if we have some movies here in our watch list

and if we then reload the page, then you see

that of course our movies are going to be gone.

So they're not persisted, so they're not stored anywhere.

we will now use local storage to store

this watched data information in the browser.



1) First, each time that the watch list state is updated

we will update the local storage.

So we will store that data into local storage





2) and then each time that the application loads

so when the app component first mounts

we will read that data from local storage

and store it into the watched state.



*/

//! UseRef Hook
// Use the UseRef Hook to create something called a ref
// Ref stands for reference and essentially it's like a box into which we can put any data that we want to be preserved between renders

// When we use useRef , react will give us an object with a mutable current property that is persisted across renders

// Refs are mutable while states are immutable

// Two big use case for refs
// 1) Creating a variable that stays the same between renders (previous state, id , setTimeout
// 2) Selecting and storing DOM elemnents

// Refs are usually stored in event handlers or effects but not in the main jsx

// Updating Refs will not cause the component to re-render

// Refs are updated synchronously , so we can read a new current property after updating ref

//! Custom Hooks

// Custom Hooks are all about reusability

// 1) Reusability in terms of a piece of UI (use a component)
// 2) Reusability in terms of a piec of logic (use a regular function if the logic does not contain any hooks) (use a custom hook if the logic contains hooks)

// Pass in arguments to regular functions or to hooks
// Pass in props to components
