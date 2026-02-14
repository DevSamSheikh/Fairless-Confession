import type { Request } from 'express';

export interface ClientInfo {
  ip_address: string | null;
  mac_address: string | null;
  mobile_sim_number: string | null;
  device_info: string | null;
}

export function getClientInfo(req: Request, body?: { mac_address?: string; mobile_sim_number?: string }): ClientInfo {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = typeof forwarded === 'string'
    ? forwarded.split(',')[0].trim()
    : req.socket?.remoteAddress ?? null;

  const device_info = req.headers['user-agent'] ?? null;

  return {
    ip_address: ip || null,
    mac_address: body?.mac_address ?? (req.headers['x-mac-address'] as string) ?? null,
    mobile_sim_number: body?.mobile_sim_number ?? (req.headers['x-mobile-sim'] as string) ?? null,
    device_info: device_info || null
  };
}
