import React, {useState, useEffect} from 'react'
import {Quotes} from './components/Quotes'
import "./App.css";
/*
    useState: This is a hook in React that allows functional components to manage state.
    It returns an array containing the current state value and a function to update it.

    useEffect: This is another hook that enables you to perform side effects in functional components.
    Side effects can include data fetching, DOM manipulation, and more. You use useEffect to handle
    lifecycle events in functional components.
*/
function App() {
    const [quotes, setQuotes] = useState([{}])
    useEffect(() => {
        fetch("/quotes").then(
            res => res.json()
        ).then(
            data => {
//                console.log(data);
                setQuotes(data)
            }
        )
    }, [])
  return (
    <div className="App">
    <Quotes quotes={quotes}/>
    </div>
  );
}

export default App;
