// src/utils/dataUtils.js

import { parse, isWithinInterval, format, isToday, isAfter, isBefore } from 'date-fns';

/**
 * Check if a location is open based on current time and its schedule
 * @param {string} schedule - The hours string e.g. "Monday: 9:00 AM - 3:00 PM"
 * @param {Date} currentDate - Date to check
 * @returns {{isOpenToday: boolean, isOpenNow: boolean, hoursToday: string}}
 */
export function checkOpenStatus(schedule, currentDate = new Date()) {
  if (!schedule) return { isOpenToday: false, isOpenNow: false, hoursToday: 'N/A' };

  const dayName = format(currentDate, 'EEEE'); // Get current day e.g. Monday
  const lines = schedule.split('\n');
  const todayLine = lines.find(line => line.startsWith(dayName));

  if (!todayLine || todayLine.includes('Closed')) {
    return { isOpenToday: false, isOpenNow: false, hoursToday: 'Closed' };
  }

  const hoursMatch = todayLine.match(/(\d{1,2}:\d{2} [APMapm]{2})\s*-\s*(\d{1,2}:\d{2} [APMapm]{2})/);
  if (!hoursMatch) return { isOpenToday: false, isOpenNow: false, hoursToday: todayLine };

  const [, startStr, endStr] = hoursMatch;
  const startTime = parse(startStr, 'h:mm a', currentDate);
  const endTime = parse(endStr, 'h:mm a', currentDate);

  const isOpenNow = isWithinInterval(currentDate, { start: startTime, end: endTime });

  return {
    isOpenToday: true,
    isOpenNow,
    hoursToday: `${startStr} - ${endStr}`
  };
}

/**
 * Filter sites by wraparound services
 */
export function filterByServices(sites, desiredServices) {
  return sites.filter(site => {
    if (!site.wraparound_services) return false;
    const services = site.wraparound_services.map(s => s.toLowerCase());
    return desiredServices.some(d => services.includes(d.toLowerCase()));
  });
}

/**
 * Filter sites by cultures served
 */
export function filterByCultures(sites, cultures) {
  return sites.filter(site => {
    if (!site.cultures_served) return false;
    const served = site.cultures_served.map(c => c.toLowerCase());
    return cultures.some(c => served.includes(c.toLowerCase()));
  });
}

/**
 * Format contact information block
 */
export function formatContactBlock(site) {
  const phone = site.phone || 'Not provided';
  const appointment = site.appointment_required ? 'Yes' : 'No';
  const address = site.address || 'No address listed';

  return `📍 ${site.name}\n${address}\n📞 ${phone}\nAppointment Required: ${appointment}`;
}