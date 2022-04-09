<template>
	<div class="layout-topbar">
		<router-link to="/" class="layout-topbar-logo">
			<img alt="Logo" :src="topbarImage()" />
			<span>Ore no App</span>
		</router-link>
		<button class="p-link layout-menu-button layout-topbar-button" @click="onMenuToggle">
			<i class="pi pi-bars"></i>
		</button>

		<button class="p-link layout-topbar-menu-button layout-topbar-button"
			v-styleclass="{ selector: '@next', enterClass: 'hidden', enterActiveClass: 'scalein', 
			leaveToClass: 'hidden', leaveActiveClass: 'fadeout', hideOnOutsideClick: true}">
			<i class="pi pi-ellipsis-v"></i>
		</button>
		<ul class="layout-topbar-menu hidden lg:flex origin-top">
			<li>
				<button class="p-link layout-topbar-button" @click="goto('setting')">
					<i class="pi pi-cog"></i>
					<span>Settings</span>
				</button>
			</li>
			<li>
				<button class="p-link layout-topbar-button" @click="toggleProfile">
					<i class="pi pi-user"></i>
					<span>Profile</span>
				</button>
				<OverlayPanel v-if="profiles.list.length" ref="op" appendTo="body" :showCloseIcon="false">
					<Card v-for="(items, i) of profiles.list" class="card-width" :key="i" style="cursor: pointer;" @click="selectProfile(i)">
						<template v-slot:content>
							<div style="display: flex; align-items: center; justify-content: space-between;">
								<p class="line-height-3 m-0">{{items.name}}</p>
								<i v-if="profiles.selected == i" class="pi pi-check" style="font-size: 2rem"></i>
							</div>
						</template>
					</Card>
				</OverlayPanel>
			</li>
		</ul>
	</div>
</template>

<script>
import { profileStore, saldoStore } from './store/finance.js'

export default {
	data() {
		return {
			profiles: profileStore(),
			saldo: saldoStore()
		}
	},
    methods: {
        onMenuToggle(event) {
            this.$emit('menu-toggle', event);
        },
		onTopbarMenuToggle(event) {
            this.$emit('topbar-menu-toggle', event);
        },
		topbarImage() {
			return this.$appState.darkTheme ? 'images/logo-white.svg' : 'images/logo-dark.svg';
		},
		toggleProfile(event) {
			if(this.profiles.list.length) {
				this.$refs.op.toggle(event);
			}
		},
		selectProfile(i) {
			this.profiles.select(i)
			this.saldo.getSaldo(this.profiles.list[i].id)
			this.$refs.op.hide()
		},
		goto(page) {
			const ul = document.getElementsByTagName('ul')[0]
			ul.className += ' hidden'
			this.$router.push({name: page})
		}
    },
	computed: {
		darkTheme() {
			return this.$appState.darkTheme;
		}
	}
}
</script>

<style>
	.card-width {
		width: 300px;
	}

	@media screen and (max-width: 575px) {
		.card-width {
			width: 200px;
		}
	}
</style>