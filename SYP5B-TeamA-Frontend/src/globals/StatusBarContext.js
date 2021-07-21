import React, {useState, createContext} from 'react';

let StatusBarContext = createContext();

function StatusBarContextProvider ({children}) {
    let [message, setMessage] = useState(null);

    return (
        <StatusBarContext.Provider value={{message, setMessage}}>
            {children}
        </StatusBarContext.Provider>
    )
}

export default StatusBarContext;
export {StatusBarContextProvider, StatusBarContext}