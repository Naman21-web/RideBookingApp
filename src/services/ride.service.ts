import { PRICING } from "../utils/constants";
import { calculateDistance } from "../utils/distance";

export const estimateFare = async (
  pickupLat: number,
  pickupLng: number,
  dropLat: number,
  dropLng: number
) => {
  const distance = calculateDistance(
    pickupLat,
    pickupLng,
    dropLat,
    dropLng
  );

  const fares: any = {};

  for (const [type, config] of Object.entries(PRICING)) {
    const price = config.baseFare + distance * config.perKm;

    fares[type] = {
      estimatedPrice: Math.round(price),
      distance: Number(distance.toFixed(2)),
      eta: `${Math.ceil(distance * 2)} mins`, // simple logic
    };
  }

  return fares;
};