export const parse1000 = (number) => {
    if (!number) return 0
    const n = parseInt(number)
    if (n > 999999) {
        return (n / 1000000).toFixed(1) + 'M'
    } else if (n > 1099) {
        return (n / 1000).toFixed(1) + 'K'
    }
    return n
}