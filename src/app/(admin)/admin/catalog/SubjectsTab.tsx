"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, Plus, Loader2 } from "lucide-react"

interface GlobalSubject {
  id: string
  name: string
  code: string
  active: boolean
  _count: { schoolSubjects: number }
}