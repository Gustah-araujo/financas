/**
 * Formata um valor em centavos para o padrão monetário BRL.
 * @param cents - Valor em centavos (ex: 10000)
 * @returns String formatada (ex: "R$ 100,00")
 */
export function formatCurrency(cents: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(cents / 100);
}

/**
 * Formata uma data no formato ISO `YYYY-MM-DD` para `DD/MM/YYYY`.
 * @param dateStr - Data no formato "2026-04-08"
 * @returns Data no formato "08/04/2026"
 */
export function formatDate(dateStr: string): string {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
}

/**
 * Formata uma data no formato ISO `YYYY-MM-DD` para formato longo pt-BR.
 * @param dateStr - Data no formato "2026-04-08"
 * @returns Data no formato "08 de abril de 2026"
 */
export function formatDateTime(dateStr: string): string {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
}
