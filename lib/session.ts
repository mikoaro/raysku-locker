import { v4 as uuidv4 } from 'uuid';

const SESSION_KEY = 'infinite_shelf_session_uuid';

export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = uuidv4();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function resetSessionId(): string {
  if (typeof window === 'undefined') return '';
  const newId = uuidv4();
  localStorage.setItem(SESSION_KEY, newId);
  return newId;
}
