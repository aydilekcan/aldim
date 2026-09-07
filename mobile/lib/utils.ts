import * as Crypto from 'expo-crypto';
export function uid(_prefix='id'): string { return Crypto.randomUUID(); }
export function isNonEmptyString(value:unknown):value is string{return typeof value==='string'&&value.trim().length>0;}
