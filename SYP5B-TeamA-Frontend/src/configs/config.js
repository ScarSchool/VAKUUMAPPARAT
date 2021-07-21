const configuration = {
    port: 8080,
    protocol: 'https',
    hostname: 'vakuumappar.at',
    apiVersion: '/api/v1',
    loginEndpoint: '/login',
    categoriesEndpoint: '/categories',
    usersEndpoint: '/users',
    tagsEndpoint: '/tags',
    notificationsEndpoint: '/notifications',
    reviewsEndpoint: '/reviews',
    profileEndpoint: '/profile',
    userLikeEndpoint: '/setLikeState',
    dashboardEndpoint: '/dashboardInfo',
    answersEndpoint: '/answers',
    defaultRequirements: [
        'Price',
        'Location',
        'Level of knowledge'
    ],
}

export default configuration; 