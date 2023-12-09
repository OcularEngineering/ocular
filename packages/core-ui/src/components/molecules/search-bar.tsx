import React, { useEffect, useState } from "react"
import { useHotkeys } from "react-hotkeys-hook"
import { useLocation } from "react-router-dom"
import SearchIcon from "../fundamentals/icons/search-icon"
import SearchModal from "../templates/search-modal"

const SearchBar: React.FC = () => {
  const [showSearchModal, setShowSearchModal] = useState(false)
  const location = useLocation()

  const toggleSearch = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setShowSearchModal((show) => !show)
  }

  const closeModal = () => {
    setShowSearchModal(false)
  }

  useEffect(() => {
    closeModal()
  }, [location])

  return (
    <>
      <button
        onClick={() => setShowSearchModal(true)}
        className="px-small flex basis-1/2 items-center py-[6px]"
      >
        <SearchIcon className="text-grey-40" />
        <span className="ml-xsmall text-grey-40 inter-base-regular">
          Search anything...
        </span>
      </button>
      {showSearchModal && <SearchModal handleClose={closeModal} />}
    </>
  )
}

export default SearchBar
