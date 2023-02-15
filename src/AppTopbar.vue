<template>
	<Toast/>
	<div class="layout-topbar" @touchmove="preventScroll($event)">
		<router-link to="/" class="layout-topbar-logo">
			<img alt="Logo" :src="topbarImage()" />
			<span>Ore no App</span>
		</router-link>
		<button class="p-link layout-menu-button layout-topbar-button" @click="onMenuToggle">
			<i class="pi pi-bars"></i>
		</button>
		
		<button class="p-link layout-topbar-menu-button layout-topbar-button profile" @click="toggleProfile" v-touch:swipe="changeProfile">
			<div class="profile-logo" :style="`background-color: ${profiles.list[profiles.selected] ? profiles.list[profiles.selected].color : ''};`">
				{{profiles.list[profiles.selected] ? profiles.list[profiles.selected].name.charAt(0) : ''}}
			</div>
		</button>
		<OverlayPanel v-if="profiles.list.length" ref="op" appendTo="body" :showCloseIcon="false" class="menu-profile">
			<Card v-for="(items, i) of profiles.list" class="card-width" :key="i" style="cursor: pointer;" @click="selectProfile(i, $event)">
				<template v-slot:content>
					<div style="display: flex; align-items: center; justify-content: space-between;">
						<p class="line-height-3 m-0">{{items.name}}</p>
						<i v-if="profiles.selected == i" class="pi pi-check" style="font-size: 2rem"></i>
						<div v-else>
							<span class="p-buttonset">
								<Button icon="pi pi-pencil" class="button-small p-button-success" @click="editProfile(i)" />
								<Button icon="pi pi-trash" class="button-small p-button-warning" @click="confirmDeleteProfile(i)" />
							</span>
						</div>
					</div>
				</template>
			</Card>
			<Card class="card-width" style="cursor: pointer;" @click="addProfile">
				<template v-slot:content>
					<div style="display: flex; align-items: center; justify-content: center;">
						<i class="pi pi-plus mr-3" style="font-size: 2rem"></i>
						<p class="line-height-3 m-0">Tambah Baru</p>
					</div>
				</template>
			</Card>
		</OverlayPanel>

		<Dialog v-model:visible="profileDialog" :style="{width: '450px'}" header="Tambah Profil" :modal="true" class="p-fluid" :dismissableMask="true">
			<div class="field">
				<label for="name">Nama</label>
				<InputText id="name" v-model="profile.name" required="true" autofocus :class="{'p-invalid': submitted && !profile.name}" autocomplete="off" @keypress.enter="saveProfile" />
				<small class="p-invalid" v-if="submitted && !profile.name">Nama harus diisi.</small>
				<ColorPicker v-model="color" style="width: 100%; margin-top: 20px"/>
			</div>
			<template #footer>
				<Button label="Simpan" icon="pi pi-check" class="p-button-text" :loading="submitting" @click="saveProfile" />
			</template>
		</Dialog>

		<Dialog v-model:visible="deleteProfileDialog" :style="{width: '450px'}" header="Konfirmasi" :modal="true" class="p-fluid" :dismissableMask="true">
			<div class="flex align-items-center justify-content-center">
				<i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
				<span>Apakah anda yakin ingin menghapus <b>{{profile.name}}</b>? Data transaksi dari profil ini juga akan ikut terhapus.</span>
			</div>
			<template #footer>
				<Button label="Tidak" icon="pi pi-times" class="p-button-text" @click="deleteProfileDialog = false"/>
				<Button label="Ya" icon="pi pi-check" :loading="submitting" class="p-button-text" @click="saveProfile($event, true)" />
			</template>
		</Dialog>
	</div>
</template>

<script>
import FinanceService from './service/FinanceService'
import { profileStore, saldoStore } from './store/finance.js'

export default {
	emits: ['menu-toggle'],
	data() {
		return {
			profiles: profileStore(),
			saldo: saldoStore(),
			profileDialog: false,
			deleteProfileDialog: false,
			profile: {},
			submitted: false,
			submitting: false,
			selected: null,
			color: 'black'
		}
	},
	financeService: null,
	created() {
		this.financeService = new FinanceService()
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
		selectProfile(i, e) {
			const tag = e.target.nodeName
			if(tag == 'BUTTON' || tag == 'SPAN') return
			this.profiles.select(i)
			this.saldo.getSaldo(this.profiles.list[i].id)
			this.$refs.op.hide()
		},
		changeProfile(dir) {
			if(dir == 'top') {
				if(this.profiles.selected == this.profiles.list.length - 1) this.profiles.selected = 0
				else this.profiles.selected++
				this.saldo.getSaldo(this.profiles.list[this.profiles.selected].id)
			}
			else if(dir == 'bottom') {
				if(this.profiles.selected == 0) this.profiles.selected = this.profiles.list.length - 1
				else this.profiles.selected--
				this.saldo.getSaldo(this.profiles.list[this.profiles.selected].id)
			}
		},
		goto(page) {
			const ul = document.getElementsByTagName('ul')[0]
			ul.className += ' hidden'
			this.$router.push({name: page})
		},
		addProfile() {
			this.$refs.op.hide()
			this.profile = {}
			this.color = 'black'
			this.submitted = false
			this.profileDialog = true
		},
		editProfile(i) {
			this.$refs.op.hide()
			this.profile = this.profiles.list[i]
			this.color = this.profiles.list[i].color
			this.selected = i
			this.submitted = false
			this.profileDialog = true
		},
		confirmDeleteProfile(i) {
			this.$refs.op.hide()
			this.selected = i
			this.profile = this.profiles.list[i]
			this.deleteProfileDialog = true
		},
		async saveProfile(e, isDelete = false) {
			let res, stat, message, summary
			this.submitted = true
			this.submitting = true

			if(!this.profile.name) {
				this.submitting = false
				return
			}

			try {
				if(!this.profile.id) res = await this.financeService.createProfile({ name: this.profile.name, color: `#${this.color}`})
				else if(!isDelete) res = await this.financeService.updateProfile({ name: this.profile.name, color: `#${this.color}`}, this.profile.id)
				else res = await this.financeService.deleteProfile(this.profile.id)

				if(res.status == 200) {
					stat = 'success'
					message = res.data.message
					summary = 'Sukses'
					if(!this.profile.id) this.profiles.pusher(res.data.result)
					else if(!isDelete) this.profiles.changer(this.selected, this.profile.name)
					else this.profiles.splicer(this.selected)
				}
				else {
					stat = 'error'
					message = res.data.message
					summary = 'Gagal'
				}
			}
			catch(err) {
				stat = 'error'
				message = err.response ? err.response.data.message : 'Data gagal disimpan.'
				summary = 'Gagal'
			}

			this.profileDialog = false
			this.deleteProfileDialog = false
			this.$toast.add({severity: stat, summary, detail: message, life: 3000})
			this.submitting = false
		},
        preventScroll(e) {
            e.preventDefault()
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

	.menu-profile {
		max-height: 400px;
		overflow: auto;
	}

	.button-small {
		height: 2rem !important;
		width: 2rem !important;
	}

	.profile {
		margin: 0 0 0 auto;
		padding: 0;
		list-style: none;
		display: flex !important;
	}

	.profile-logo {
		width: 40px;
		height: 40px;
		border-radius: 30px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
	}

	@media screen and (max-width: 575px) {
		.card-width {
			width: 200px;
		}

		.menu-profile {
			max-height: 300px;
		}
	}
</style>