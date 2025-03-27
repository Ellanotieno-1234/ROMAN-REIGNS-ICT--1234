import { useEffect } from 'react'
import { supabase } from './supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface RealtimeServiceOptions<T = any> {
  table: string
  onUpdate: (payload: T) => void
  onError?: (error: Error) => void
}

export function useRealtime<T>(options: RealtimeServiceOptions<T>) {
  useEffect(() => {
    let subscription: RealtimeChannel

    const setupSubscription = async () => {
      subscription = supabase
        .channel('analytics_updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: options.table
          },
          (payload) => options.onUpdate(payload.new as T)
        )
        .subscribe()

      return () => {
        supabase.removeChannel(subscription)
      }
    }

    setupSubscription().catch(error => {
      console.error('Realtime subscription error:', error)
      options.onError?.(error)
    })

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription)
      }
    }
  }, [options.table, options.onUpdate, options.onError])
}
