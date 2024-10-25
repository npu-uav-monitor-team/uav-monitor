<script setup>
    import { onMounted } from 'vue'
    
    import { useRouter } from 'vue-router'
    
    const router = useRouter()
    
    onMounted(async () => {
        alert('您似乎来到了不存在的页面,三秒后跳转到上一页面')
        setInterval(async () => {
            await router.go(-1)
        }, 3000)
    })
</script>

<template>
    <div></div>
</template>

