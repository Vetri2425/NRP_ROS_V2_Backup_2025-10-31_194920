
import React from 'react';
import { Waypoint, RoverData } from '../../types';
import { BatteryIcon } from '../icons/BatteryIcon';
import { RtkIcon } from '../icons/RtkIcon';
import { ImuIcon } from '../icons/ImuIcon';

type LiveStatusbarProps = {
  missionName: string | null;
  waypoints: Waypoint[];
  liveRoverData: RoverData;
};

const StatusItem: React.FC<{ label: string; value: string | number; unit?: string; status?: string }> = ({ label, value, unit, status }) => {
    let statusClass = '';
    if (status === 'ALIGNED' || status?.includes('RTK Fixed')) {
        statusClass = 'bg-green-600 text-white';
    } else if (status?.includes('OK') && !status.includes('LOW')) {
        statusClass = 'bg-green-600 text-white';
    } else if (status?.includes('LOW')) {
        statusClass = 'bg-red-600 text-white';
    } else if (status?.includes('RTK Float') || status?.includes('DGPS')) {
        statusClass = 'bg-yellow-600 text-white';
    } else if (status) {
        statusClass = 'bg-blue-500 text-white';
    }

    return (
        <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2 text-gray-300">
                {label === 'Battery' && <BatteryIcon level={typeof value === 'number' ? value : undefined} className="w-5 h-5" />}
                {label === 'GPS' && <RtkIcon className="w-5 h-5 text-blue-400" />}
                {label === 'IMU' && <ImuIcon className="w-5 h-5 text-yellow-400" />}
                <span>{label}</span>
            </div>
            <div className="font-mono flex items-center gap-2">
                {value}
                {unit && <span className="text-gray-400">{unit}</span>}
                {status && <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusClass}`}>{status}</span>}
            </div>
        </div>
    );
};

const InfoItem: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="text-center">
        <p className="text-sm text-gray-400">{label}</p>
        <div className="mt-1">{children}</div>
    </div>
);

const LiveStatusbar: React.FC<LiveStatusbarProps> = ({ missionName, waypoints, liveRoverData }) => {
  const { 
    completedWaypointIds = [], 
    activeWaypointIndex, 
    distanceToNext, 
    battery, 
    voltage, 
    rtk_status, 
    imu_status,
    satellites_visible,
    fix_type
  } = liveRoverData;

  // 🔍 DEBUG: Log what LiveStatusbar receives
  React.useEffect(() => {
    console.log('[LiveStatusbar] Received liveRoverData:', {
      rtk_status,
      fix_type,
      satellites_visible,
      battery,
      voltage,
      'has_position': !!liveRoverData.position
    });
  }, [rtk_status, fix_type, satellites_visible, battery, voltage, liveRoverData.position]);

  const activeWaypointId =
    activeWaypointIndex !== null && activeWaypointIndex !== undefined
      ? activeWaypointIndex + 1
      : null;

  const lastCompletedWpId = completedWaypointIds.length > 0 ? completedWaypointIds[completedWaypointIds.length - 1] : null;
  const lastCompletedWp = waypoints.find(wp => wp.id === lastCompletedWpId);
  const nextWp = waypoints.find(wp => wp.id === activeWaypointId);

  let deltaElevation = 0;
  if (lastCompletedWp) {
      const prevIndex = waypoints.findIndex(wp => wp.id === lastCompletedWp.id) - 1;
      if (prevIndex >= 0) {
        deltaElevation = lastCompletedWp.alt - waypoints[prevIndex].alt;
      }
  }

  // Format battery voltage properly
  const batteryVoltage = voltage ? voltage.toFixed(2) : '0.00';
  const batteryPercentage = battery ? Math.round(battery) : 0;
  const batteryStatus = batteryPercentage > 20 ? `OK ${batteryPercentage}%` : `LOW ${batteryPercentage}%`;
  
  // Format HRMS and VRMS
  const hrmsValue = typeof liveRoverData.hrms === 'number' ? liveRoverData.hrms.toFixed(3) : liveRoverData.hrms;
  const vrmsValue = typeof liveRoverData.vrms === 'number' ? liveRoverData.vrms.toFixed(3) : liveRoverData.vrms;
  
  // Determine IMU status
  const imuStatusText = imu_status && imu_status !== 'UNKNOWN' ? imu_status : 'ALIGNED';
  
  // Satellites
  const satellitesCount = satellites_visible ?? 0;

  // 🔍 DEBUG: Log final display values
  console.log('[LiveStatusbar] Display values:', {
    'GPS/RTK status': rtk_status || 'No Fix',
    'Satellites': satellitesCount,
    'Battery': batteryStatus
  });

  return (
    <div className="h-full grid grid-cols-3 gap-4 text-white">
      {/* Panel 1: Status */}
      <div className="bg-[#111827] rounded-lg p-3 flex flex-col">
        <h3 className="text-center font-bold text-gray-400 border-b border-gray-700 pb-2 mb-3">Status</h3>
        <div className="space-y-2">
            <StatusItem label="Battery" value={batteryVoltage} unit="v" status={batteryStatus} />
            <StatusItem label="GPS/RTK" value="" status={rtk_status || 'No Fix'} />
            <StatusItem label="Satellites" value={satellitesCount} />
            <StatusItem label="HRMS" value={hrmsValue} unit="m" />
            <StatusItem label="VRMS" value={vrmsValue} unit="m" />
            <StatusItem label="IMU" value="" status={imuStatusText} />
        </div>
      </div>

      {/* Panel 2: Mission Grid */}
      <div className="bg-[#111827] rounded-lg p-3 flex flex-col justify-center items-center text-center">
        <h3 className="text-xl font-bold text-gray-300 truncate w-full" title={missionName || 'No Mission'}>{missionName || 'No Mission Loaded'}</h3>
        <p className="text-gray-400">{waypoints.length} points in current mission</p>
        <p className="text-4xl font-light mt-2">
            Distance: {distanceToNext.toFixed(2)}' <span className="text-2xl text-gray-400">[f]</span>
        </p>
      </div>

      {/* Panel 3: Info */}
      <div className="bg-[#111827] rounded-lg p-3 flex items-center justify-around">
        <InfoItem label="Marked Point">
            <p className="text-2xl font-bold bg-gray-600 px-4 py-1 rounded-md">{lastCompletedWp ? `p${lastCompletedWp.id}` : '---'}</p>
            {lastCompletedWp ? (
              <>
                <p className="text-xs text-gray-400 mt-1">
                  Lat: {lastCompletedWp.lat.toFixed(7)}
                </p>
                <p className="text-xs text-gray-400">
                  Lng: {lastCompletedWp.lng.toFixed(7)}
                </p>
                <p className="text-sm font-bold text-white bg-blue-600 px-3 py-1 mt-1 rounded-md">
                  {lastCompletedWp.command || 'WAYPOINT'}
                </p>
              </>
            ) : (
              <p className="text-sm font-bold text-white bg-gray-500 px-3 py-1 mt-2 rounded-md">N/A</p>
            )}
        </InfoItem>
        <InfoItem label="Delta Elevation">
             <p className={`text-4xl font-bold p-2 rounded-md ${deltaElevation > 0 ? 'text-green-400' : deltaElevation < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                {deltaElevation !== 0 ? (
                  <>{deltaElevation >= 0 ? '+' : ''}{deltaElevation.toFixed(2)}' f {deltaElevation >= 0 ? '↑' : '↓'}</>
                ) : (
                  '---'
                )}
             </p>
        </InfoItem>
        <InfoItem label="Next Point">
            <p className="text-2xl font-bold bg-orange-500 px-4 py-1 rounded-md">{nextWp ? `p${nextWp.id}` : '---'}</p>
            {nextWp ? (
              <>
                <p className="text-xs text-gray-400 mt-1">
                  Lat: {nextWp.lat.toFixed(7)}
                </p>
                <p className="text-xs text-gray-400">
                  Lng: {nextWp.lng.toFixed(7)}
                </p>
                <p className="text-sm font-bold text-white bg-blue-600 px-3 py-1 mt-1 rounded-md">
                  {nextWp.command || 'WAYPOINT'}
                </p>
              </>
            ) : (
              <p className="text-sm font-bold text-white bg-gray-500 px-3 py-1 mt-2 rounded-md">N/A</p>
            )}
        </InfoItem>
      </div>
    </div>
  );
};

export default LiveStatusbar;
