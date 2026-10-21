package com.connectx.messenger

import android.app.Application
import com.google.firebase.FirebaseApp

class ConnectXApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        FirebaseApp.initializeApp(this)
    }
}
