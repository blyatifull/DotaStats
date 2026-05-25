export interface Item {
  id: number
  name: string
  shortName: string
  displayName: string
  cost: number
  description: string
  lore: string
  notes: string[]
  attributes: ItemAttribute[]
  components: number[]
  isNeutral: boolean
  neutralTier: number | null
  isRecipe: boolean
  isSideShop: boolean
  isSecretShop: boolean
}

export interface ItemAttribute {
  key: string
  header: string
  value: string
  footer: string
}

export interface ItemBuildTiming {
  itemId: number
  averageTime: number
  winRate: number
  popularity: number
}
