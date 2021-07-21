import React, {useState, createContext} from 'react';

let NotificationsContext = createContext();

function NotificationsContextProvider ({children}) {
    let [unread, setUnread] = useState(0);
    let [notifications, setNotifications] = useState([]);

    return (
        <NotificationsContext.Provider value={{unread, setUnread, notifications, setNotifications}}>
            {children}
        </NotificationsContext.Provider>
    )
}

export default NotificationsContext;
export {NotificationsContextProvider, NotificationsContext}