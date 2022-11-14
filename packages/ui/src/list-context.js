
export function generateContext(multiple) {
    return {
        /**
         * Main state...
         */
        searchableText: {},
        disabledKeys: [],
        activeKey: null,
        selectedKeys: [],
        orderedKeys: [],
        elsByKey: {},
        values: {},

        /**
         *  Initialization...
         */
        initItem(el, value, disabled) {
            let key = (Math.random() + 1).toString(36).substring(7)

            // Register value by key...
            this.values[key] = value

            // Associate key with element...
            this.elsByKey[key] = el

            // Register key for ordering...
            this.orderedKeys.push(key)

            // Register key for searching...
            this.searchableText[key] = el.textContent.trim().toLowerCase()

            // Store whether disabled or not...
            disabled && this.disabledKeys.push(key)

            return key
        },

        /**
         * Handle elements...
         */
        activeEl() {
            if (! this.activeKey) return

            return this.elsByKey[this.activeKey]
        },

        isActiveEl(el) {
            let key = keyByValue(this.elsByKey, el)

            if (! key) return

            return this.activeKey === key
        },

        activateEl(el) {
            let key = keyByValue(this.elsByKey, el)

            if (! key) return

            this.activateKey(key)
        },

        selectEl(el) {
            let key = keyByValue(this.elsByKey, el)

            if (! key) return

            this.selectKey(key)
        },

        isSelectedEl(el) {
            let key = keyByValue(this.elsByKey, el)

            if (! key) return

            return this.isSelected(key)
        },

        isDisabledEl(el) {
            let key = keyByValue(this.elsByKey, el)

            if (! key) return

            return this.isDisabled(key)
        },

        scrollToKey(key) {
            this.elsByKey[key].scrollIntoView({ block: 'nearest' })
        },

        /**
         * Handle values...
         */
        selectedValueOrValues() {
            if (multiple) {
                return this.selectedValues()
            } else {
                return this.selectedValue()
            }
        },

        selectedValues() {
            return this.selectedKeys.map(i => this.values[i])
        },

        selectedValue() {
            return this.selectedKeys[0] ? this.values[this.selectedKeys[0]] : null
        },

        /**
         * Handle disabled keys...
         */
        isDisabled(key) { return this.disabledKeys.includes(key) },

        get nonDisabledOrderedKeys() {
            return this.orderedKeys.filter(i => ! this.isDisabled(i))
        },

        /**
         * Handle selected keys...
         */
        selectKey(key) {
            if (this.isDisabled(key)) return

            if (multiple) {
                this.toggleSelected(key)
            } else {
                this.selectOnly(key)
            }
        },

        toggleSelected(key) {
            if (this.selectedKeys.includes(key)) {
                this.selectedKeys.splice(this.selectedKeys.indexOf(key), 1)
            } else {
                this.selectedKeys.push(key)
            }
        },

        selectOnly(key) {
            this.selectedKeys = []
            this.selectedKeys.push(key)
        },

        selectActive(key) {
            if (! this.activeKey) return

            this.selectKey(this.activeKey)
        },

        isSelected(key) { return this.selectedKeys.includes(key) },


        firstSelectedKey() { return this.selectedKeys[0] },

        /**
         * Handle activated keys...
         */
        hasActive() { return !! this.activeKey },

        isActiveKey(key) { return this.activeKey === key },

        activateSelectedOrFirst() {
            let firstSelected = this.firstSelectedKey()

            if (firstSelected) {
                return this.activateKey(firstSelected)
            }

            let firstKey = this.firstKey()

            if (firstKey) {
                this.activateKey(firstKey)
            }
        },

        activateKey(key) {
            if (this.isDisabled(key)) return

            this.activeKey = key
        },

        deactivate() { return this.activeKey = null },

        /**
         * Handle active key traveral...
         */

        nextKey() {
            if (! this.activeKey) return

            let index = this.nonDisabledOrderedKeys.findIndex(i => i === this.activeKey)

            return this.nonDisabledOrderedKeys[index + 1]
        },

        prevKey() {
            if (! this.activeKey) return

            let index = this.nonDisabledOrderedKeys.findIndex(i => i === this.activeKey)

            return this.nonDisabledOrderedKeys[index - 1]
        },

        firstKey() { return this.nonDisabledOrderedKeys[0] },

        lastKey() { return this.nonDisabledOrderedKeys[this.nonDisabledOrderedKeys.length - 1] },

        searchQuery: '',

        clearSearch: Alpine.debounce(function () { this.searchQuery = '' }, 350),

        searchKey(query) {
            this.clearSearch()

            this.searchQuery += query

            let foundKey

            for (let key in this.searchableText) {
                let content = this.searchableText[key]

                if (content.startsWith(this.searchQuery)) {
                    foundKey = key
                    break;
                }
            }

            if (! this.nonDisabledOrderedKeys.includes(foundKey)) return

            return foundKey
        },

        activateByKeyEvent(e) {
            let hasActive = this.hasActive()

            let targetKey

            switch (e.key) {
                case 'Tab':
                case 'Backspace':
                case 'Delete':
                case 'Meta':
                    break;

                    break;
                case ['ArrowDown', 'ArrowRight'][0]: // @todo handle orientation switching.
                    e.preventDefault(); e.stopPropagation()
                    targetKey = hasActive ? this.nextKey() : this.firstKey()
                    break;

                case ['ArrowUp', 'ArrowLeft'][0]:
                    e.preventDefault(); e.stopPropagation()
                    targetKey = hasActive ? this.prevKey() : this.lastKey()
                    break;
                case 'Home':
                case 'PageUp':
                    e.preventDefault(); e.stopPropagation()
                    targetKey = this.firstKey()
                    break;

                case 'End':
                case 'PageDown':
                    e.preventDefault(); e.stopPropagation()
                    targetKey = this.lastKey()
                    break;

                default:
                    if (e.key.length === 1) {
                        targetKey = this.searchKey(e.key)
                    }
                    break;
            }

            if (targetKey) {
                this.activateKey(targetKey)

                setTimeout(() => this.scrollToKey(targetKey))
            }
        }
    }
}

function keyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value)
}

// reorderList() {
//     this.items = this.items.slice().sort((a, z) => {
//         if (a === null || z === null) return 0

//         let position = a.el.compareDocumentPosition(z.el)

//         if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1
//         if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1
//         return 0
//     })
// },
