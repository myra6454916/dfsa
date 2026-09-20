/* Синхронизация интерфейса.

   Модуль "ui" хранит исходник панели (CSS + createCustomizer) и отдаёт его
   строкой через source(); страница исполняет сгенерированную из него копию.
   Скрипт переносит обе части из источника в копию, чтобы правки в одном
   месте не расходились со вторым. */
const fs = require('fs');
const file = process.argv[2] || 'm416.html';
let src = fs.readFileSync(file, 'utf8');

/* 1. CSS */
const cssOpen = '  const CSS = `';
const cssStart = src.indexOf(cssOpen) + cssOpen.length;
const cssEnd = src.indexOf('`;\n\n  /* Подписи и порядок показа характеристик.');
if (cssStart < cssOpen.length || cssEnd < 0) throw new Error('не найден CSS модуля ui');
const css = src.slice(cssStart, cssEnd);

const cssMark = 'const CUST_CSS = ';
const cssAt = src.indexOf(cssMark);
if (cssAt < 0) throw new Error('не найдена копия CUST_CSS');
src = src.slice(0, cssAt) + cssMark + JSON.stringify(css) + src.slice(src.indexOf(';\n', cssAt));

/* 2. Тело createCustomizer: в источнике оно внутри шаблона source() */
const FN = 'function createCustomizer(opts) {';
const tplAt = src.indexOf(FN);                       // первое вхождение — источник
const tplEnd = src.indexOf('\n`;\n  }', tplAt);
if (tplAt < 0 || tplEnd < 0) throw new Error('не найден исходник createCustomizer');
const body = src.slice(tplAt, tplEnd);

const genAt = src.indexOf(FN, tplEnd);               // второе — сгенерированная копия
const genEnd = src.indexOf("\n\n/* ---- интеграция кастомизации", genAt);
if (genAt < 0 || genEnd < 0) throw new Error('не найдена копия createCustomizer');
src = src.slice(0, genAt) + body + src.slice(genEnd);

fs.writeFileSync(file, src);
console.log('интерфейс синхронизирован: CSS ' + css.length + ' симв., код ' + body.length + ' симв.');
