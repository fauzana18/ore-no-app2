<template>
    <div class="surface-0 flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
        <div class="grid justify-content-center p-2 lg:p-0" style="min-width:80%">
            <div class="col-12 mt-5 xl:mt-0 text-center">
                <img :src="'layout/images/logo-' + logoColor + '.svg'" alt="Sakai logo" class="mb-5" style="width:81px; height:60px;">
            </div>
            <div class="col-12 xl:col-6" style="border-radius:56px; padding:0.3rem; background: linear-gradient(180deg, var(--primary-color), rgba(33, 150, 243, 0) 30%);">
                <div class="h-full w-full m-0 py-7 px-4" style="border-radius:53px; background: linear-gradient(180deg, var(--surface-50) 38.9%, var(--surface-0));">
                    <div class="text-center mb-5">
                        <img src="layout/images/avatar.png" alt="Image" height="50" class="mb-3" style="border-radius: 50%;">
                        <div class="text-900 text-3xl font-medium mb-3">Welcome, Fauzan!</div>
                        <span class="text-600 font-medium">Sign in to continue</span>
                    </div>
                
                    <div class="w-full md:w-10 mx-auto">
                        <label for="password1" class="block text-900 font-medium text-xl mb-2">PIN</label>
                        <Password id="password1" v-model="password" placeholder="PIN" :toggleMask="true" :feedback="false" 
                        class="w-full mb-3" inputClass="w-full" inputStyle="padding:1rem" @keydown="handleEnter"></Password>
                        <Message v-if="wrong" severity="error">PIN salah!</Message>
                        <Button label="Sign In" class="w-full p-3 text-xl" @click="login"></button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            password: '',
            wrong: false
        }
    },
    computed: {
        logoColor() {
            if (this.$appState.darkTheme) return 'white';
            return 'dark';
        }
    },
    methods: {
        login() {
            if(this.password == process.env.VUE_APP_PIN) {
                localStorage.setItem("pin", this.password)
                this.$router.push({name: 'finance'})
            }
            else this.wrong = true
        },
        handleEnter(e) {
            if(e.key == 'Enter') this.login()
        }
    }
}
</script>

<style scoped>
.pi-eye {
    transform:scale(1.6);
    margin-right: 1rem;
}

.pi-eye-slash {
    transform:scale(1.6);
    margin-right: 1rem;
}
</style>