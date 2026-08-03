import Foundation
import HealthKit
final class HealthKitBridge {
  private let store = HKHealthStore()
  func availability() -> Bool { HKHealthStore.isHealthDataAvailable() }
  func request(types: Set<HKObjectType>, completion: @escaping (Bool, Error?) -> Void) {
    store.requestAuthorization(toShare: [], read: types, completion: completion)
  }
}
