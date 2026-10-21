package com.connectx.messenger.ui.navigation

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.compose.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*

sealed class Screen(val route: String, val title: String) {
    object Chats : Screen("chats", "Chats")
    object Contacts : Screen("contacts", "Contacts")
    object Calls : Screen("calls", "Calls")
    object Groups : Screen("groups", "Groups")
    object Profile : Screen("profile", "Profile")
    object Settings : Screen("settings", "Settings")
    object ChatDetail : Screen("chat_detail/{conversationId}", "Chat") {
        fun createRoute(convId: String) = "chat_detail/$convId"
    }
}

@Composable
fun ConnectXNavGraph(
    navController: NavHostController = rememberNavController()
) {
    val items = listOf(
        Screen.Chats,
        Screen.Contacts,
        Screen.Calls,
        Screen.Groups,
        Screen.Profile,
        Screen.Settings
    )

    Scaffold(
        bottomBar = {
            NavigationBar {
                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentRoute = navBackStackEntry?.destination?.route

                items.forEach { screen ->
                    NavigationBarItem(
                        icon = {
                            when (screen) {
                                Screen.Chats -> Icon(Icons.Default.Chat, contentDescription = null)
                                Screen.Contacts -> Icon(Icons.Default.Contacts, contentDescription = null)
                                Screen.Calls -> Icon(Icons.Default.Call, contentDescription = null)
                                Screen.Groups -> Icon(Icons.Default.Group, contentDescription = null)
                                Screen.Profile -> Icon(Icons.Default.Person, contentDescription = null)
                                Screen.Settings -> Icon(Icons.Default.Settings, contentDescription = null)
                                else -> Icon(Icons.Default.Home, contentDescription = null)
                            }
                        },
                        label = { Text(screen.title) },
                        selected = currentRoute == screen.route,
                        onClick = {
                            if (currentRoute != screen.route) {
                                navController.navigate(screen.route) {
                                    popUpTo(navController.graph.startDestinationId)
                                    launchSingleTop = true
                                }
                            }
                        }
                    )
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Chats.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Screen.Chats.route) {
                Text(text = "ConnectX Chats Feed")
            }
            composable(Screen.Contacts.route) {
                Text(text = "ConnectX Contacts & Discovery")
            }
            composable(Screen.Calls.route) {
                Text(text = "ConnectX WebRTC Calls")
            }
            composable(Screen.Groups.route) {
                Text(text = "ConnectX Groups")
            }
            composable(Screen.Profile.route) {
                Text(text = "ConnectX Profile & Identity Triad")
            }
            composable(Screen.Settings.route) {
                Text(text = "ConnectX Settings & Offline Sync")
            }
        }
    }
}
