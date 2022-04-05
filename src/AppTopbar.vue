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
				<button class="p-link layout-topbar-button">
					<i class="pi pi-calendar"></i>
					<span>Events</span>
				</button>
			</li>
			<li>
				<button class="p-link layout-topbar-button">
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
					<Card v-for="(items, i) of profiles.list" class="card-width" :key="i" style="cursor: pointer;" @click="selectProfile(items.id)">
						<template v-slot:content>
							<p class="line-height-3 m-0">{{items.name}}</p>
						</template>
					</Card>
				</OverlayPanel>
			</li>
		</ul>
	</div>
</template>

<script>
import { profileStore } from './store/finance.js'

export default {
	data() {
		return {
			profiles: profileStore()
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
		selectProfile(profile) {
			console.log(profile)
			this.$refs.op.hide()
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