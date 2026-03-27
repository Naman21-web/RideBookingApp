import { VehicleType } from "./vehicle.types";

export interface CreateRideInput {
  pickupLat: number;
  pickupLng: number;
  dropLat: number;
  dropLng: number;
  vehicleType: VehicleType;
}