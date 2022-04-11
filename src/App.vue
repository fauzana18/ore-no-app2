<template>
	<div :class="containerClass" @click="onWrapperClick">
        <AppTopBar @menu-toggle="onMenuToggle" />
        <div class="layout-sidebar" @click="onSidebarClick">
            <AppMenu :model="menu" @menuitem-click="onMenuItemClick" v-touch:swipe.left="closeMenu" />
        </div>

        <div class="layout-main-container" v-touch:swipe.right="openMenu">
            <div class="layout-main">
                <router-view />
            </div>
            <AppFooter />
        </div>

        <transition name="layout-mask">
            <div class="layout-mask p-component-overlay" v-if="mobileMenuActive"></div>
        </transition>
	</div>
</template>

<script>
import AppTopBar from './AppTopbar.vue';
import AppMenu from './AppMenu.vue';
import AppFooter from './AppFooter.vue';
import EventBus from './AppEventBus'
import { profileStore, categoryStore, saldoStore } from './store/finance.js'

export default {
    emits: ['change-theme'],
    data() {
        return {
            layoutMode: 'static',
            staticMenuInactive: false,
            overlayMenuActive: false,
            mobileMenuActive: false,
            scale: localStorage.getItem('scale') || 14,
            menu : [
                {
                    label: 'Home',
                    items: [
                        {label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/'}
                    ]
                },
                {
                    label: 'Finance',
                    items: [
                        {label: 'Catatan Keuangan', icon: 'pi pi-fw pi-money-bill', to: '/finance'},
                        {label: 'Laporan Keuangan', icon: 'pi pi-fw pi-chart-line', to: '/finance-report'},
                    ]
                }
            ]
        }
    },
    themeChangeListener: null,
    watch: {
        $route() {
            this.menuActive = false;
            this.$toast.removeAllGroups();
        }
    },
    methods: {
        onWrapperClick() {
            if (!this.menuClick) {
                this.overlayMenuActive = false;
                this.mobileMenuActive = false;
            }

            this.menuClick = false;
        },
        onMenuToggle() {
            this.menuClick = true;

            if (this.isDesktop()) {
                if (this.layoutMode === 'overlay') {
					if(this.mobileMenuActive === true) {
						this.overlayMenuActive = true
					}

                    this.overlayMenuActive = !this.overlayMenuActive
					this.mobileMenuActive = false;
                }
                else if (this.layoutMode === 'static') {
                    this.staticMenuInactive = !this.staticMenuInactive
                }
            }
            else {
                this.mobileMenuActive = !this.mobileMenuActive
            }

            event.preventDefault();
        },
        onSidebarClick() {
            this.menuClick = true;
        },
        onMenuItemClick(event) {
            if (event.item && !event.item.items) {
                this.overlayMenuActive = false;
                this.mobileMenuActive = false;
            }
        },
		onLayoutChange(layoutMode) {
			this.layoutMode = layoutMode;
		},
        addClass(element, className) {
            if (element.classList)
                element.classList.add(className);
            else
                element.className += ' ' + className;
        },
        removeClass(element, className) {
            if (element.classList)
                element.classList.remove(className);
            else
                element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        },
        isDesktop() {
            return window.innerWidth >= 992;
        },
        isSidebarVisible() {
            if (this.isDesktop()) {
                if (this.layoutMode === 'static')
                    return !this.staticMenuInactive;
                else if (this.layoutMode === 'overlay')
                    return this.overlayMenuActive;
            }

            return true;
        },
        applyScale() {
            document.documentElement.style.fontSize = this.scale + 'px'
        },
        openMenu() {
            this.mobileMenuActive = true
        },
        closeMenu() {
            this.mobileMenuActive = false
        }
    },
    beforeUnmount() {
        EventBus.off('theme-change', this.themeChangeListener)
    },
    async mounted() {
        this.themeChangeListener = () => {
            this.applyScale()
        }

        EventBus.on('theme-change', this.themeChangeListener)
        EventBus.emit('theme-change', {
            theme: localStorage.getItem('theme') || 'bootstrap4-light-blue',
            dark: localStorage.getItem('dark') || false
        })

        const profiles = profileStore()
        const category = categoryStore()
        const saldo = saldoStore()
		await profiles.getList()
		await category.getList()
		await saldo.getSaldo(profiles.list[profiles.selected].id)
	},
    computed: {
        containerClass() {
            return ['layout-wrapper', {
                'layout-overlay': this.layoutMode === 'overlay',
                'layout-static': this.layoutMode === 'static',
                'layout-static-sidebar-inactive': this.staticMenuInactive && this.layoutMode === 'static',
                'layout-overlay-sidebar-active': this.overlayMenuActive && this.layoutMode === 'overlay',
                'layout-mobile-sidebar-active': this.mobileMenuActive,
				'p-input-filled': this.$primevue.config.inputStyle === 'filled',
				'p-ripple-disabled': this.$primevue.config.ripple === false
            }];
        },
        logo() {
            return (this.$appState.darkTheme) ? "images/logo-white.svg" : "images/logo.svg";
        }
    },
    beforeUpdate() {
        if (this.mobileMenuActive)
            this.addClass(document.body, 'body-overflow-hidden');
        else
            this.removeClass(document.body, 'body-overflow-hidden');
    },
    components: {
        'AppTopBar': AppTopBar,
        'AppMenu': AppMenu,
        'AppFooter': AppFooter,
    }
}
</script>

<style lang="scss">
@import './App.scss';
</style>
