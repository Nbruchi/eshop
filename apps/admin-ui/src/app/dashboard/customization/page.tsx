"use client"

import Breadcrumb from 'apps/admin-ui/src/components/Breadcrumb';
import { useState } from 'react';

const Customization = () => {
  const tabs = ["Categories", "Logo", "Banner"]

  const [newCategory, setNewCategory] = useState("")
  const [logo, setLogo] = useState<string | null>(null)
  const [banner, setBanner] = useState<string|null>(null)
  const [activeTab, setActiveTab] = useState("Categories")
  const [categories, setCategories] = useState<string[]>([])
  const [subCategories, setSubCategories] = useState<Record<string,string[]>>({})
  
  return (
    <div className="w-full min-h-screen p-8">
      <h2 className="text-2xl text-white font-semibold mb-2">Customization</h2>
      <Breadcrumb title="Customization" />
     
    </div>
  );
}

export default Customization