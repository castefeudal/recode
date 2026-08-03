package com.markovmade.recode
import android.app.Activity
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.PermissionController
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.StepsRecord
class HealthConnectBridge(private val activity: Activity) {
    private val client by lazy { HealthConnectClient.getOrCreate(activity) }
    val permissions = setOf(HealthPermission.getReadPermission(StepsRecord::class))
    fun availability(): Int = HealthConnectClient.getSdkStatus(activity)
    suspend fun granted(): Set<String> = client.permissionController.getGrantedPermissions()
    fun permissionContract() = PermissionController.createRequestPermissionResultContract()
}
