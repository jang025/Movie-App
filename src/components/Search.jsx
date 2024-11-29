import { useEffect, useRef } from "react";

const Search = function ({ query1, setQuery1 }) {
  // create a ref
  const inputElement = useRef(null);

  // need to use an effect in order to use a ref that contains a DOM element
  useEffect(
    function () {
      function callback(e) {
        // dont do anything if the current element is the active element
        if (document.activeElement === inputElement.current) return;
        if (e.code === "Enter") {
          inputElement.current.focus();
          setQuery1("");
        }
      }
      document.addEventListener("keydown", callback);
      return () => document.removeEventListener("keydown", callback);
    },
    [setQuery1]
  );
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query1}
      onChange={(e) => setQuery1(e.target.value)}
      //  use the ref prop
      ref={inputElement}
    />
  );
};

export default Search;
