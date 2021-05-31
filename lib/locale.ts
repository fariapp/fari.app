export type ITranslationKeys =
  | "about-route.meta.description"
  | "about-route.meta.title"
  | "character-dialog.block-type.dice-pool"
  | "character-dialog.block-type.image"
  | "character-dialog.block-type.link"
  | "character-dialog.block-type.link.display-name"
  | "character-dialog.block-type.numeric"
  | "character-dialog.block-type.point-counter"
  | "character-dialog.block-type.separator"
  | "character-dialog.block-type.skill"
  | "character-dialog.block-type.slot-tracker"
  | "character-dialog.block-type.text"
  | "character-dialog.close-confirmation"
  | "character-dialog.control.add-block"
  | "character-dialog.control.add-box"
  | "character-dialog.control.add-label"
  | "character-dialog.control.add-max"
  | "character-dialog.control.add-section"
  | "character-dialog.control.add-sub-card"
  | "character-dialog.control.add-toggle"
  | "character-dialog.control.advanced-mode"
  | "character-dialog.control.duplicate"
  | "character-dialog.control.hide-display-name"
  | "character-dialog.control.hide-modifer"
  | "character-dialog.control.move"
  | "character-dialog.control.move-down"
  | "character-dialog.control.move-left"
  | "character-dialog.control.move-right"
  | "character-dialog.control.move-up"
  | "character-dialog.control.refresh"
  | "character-dialog.control.remove-block"
  | "character-dialog.control.remove-box"
  | "character-dialog.control.remove-label"
  | "character-dialog.control.remove-max"
  | "character-dialog.control.remove-section"
  | "character-dialog.control.remove-toggle"
  | "character-dialog.control.set-dice"
  | "character-dialog.control.set-main-counter"
  | "character-dialog.control.show-display-name"
  | "character-dialog.control.show-modifier"
  | "character-dialog.control.stored"
  | "character-dialog.control.unset-main-counter"
  | "character-dialog.control.visible-on-card"
  | "character-dialog.control.wide-mode"
  | "character-dialog.control.width"
  | "character-dialog.group"
  | "character-dialog.helper-text.empty-dice-pool"
  | "character-dialog.helper-text.help"
  | "character-dialog.helper-text.invalid-link"
  | "character-dialog.image-block.dialog.add-image"
  | "character-dialog.image-block.dialog.close"
  | "character-dialog.image-block.dialog.description"
  | "character-dialog.image-block.dialog.error"
  | "character-dialog.image-block.dialog.image-url-label"
  | "character-dialog.image-block.dialog.title"
  | "character-dialog.image-block.dialog.upload"
  | "character-dialog.label.link"
  | "character-dialog.load-template"
  | "character-dialog.load-template-confirmation"
  | "character-dialog.name"
  | "character-dialog.remove-page-confirmation"
  | "character-dialog.remove-section-confirmation"
  | "character-dialog.save"
  | "character-dialog.saved"
  | "character-dialog.skill-block.roll"
  | "character-dialog.template.Blank"
  | "character-dialog.template.Dnd5e"
  | "character-dialog.template.DresdenFilesAccelerated"
  | "character-dialog.template.EdgeOfTheEmpire"
  | "character-dialog.template.EdgeOfTheEmpire_FR"
  | "character-dialog.template.FateAccelerated"
  | "character-dialog.template.FateCondensed"
  | "character-dialog.template.FateCore"
  | "character-dialog.template.FateOfCthulhu"
  | "character-dialog.template.Heartbreaker"
  | "character-dialog.template.IronEddaAccelerated"
  | "character-dialog.template.Maze"
  | "character-dialog.template.TheWitchIsDead"
  | "character-dialog.template.VentureCity"
  | "common.language.de"
  | "common.language.dev"
  | "common.language.en"
  | "common.language.eo"
  | "common.language.es"
  | "common.language.fr"
  | "common.language.gl"
  | "common.language.it"
  | "common.language.pt-BR"
  | "common.language.ru"
  | "cookie-consent.button"
  | "cookie-consent.description"
  | "data-route.delete"
  | "data-route.delete-confirmation"
  | "data-route.export"
  | "data-route.filter-by-group"
  | "data-route.filter-by-name"
  | "data-route.filter-by-type"
  | "data-route.group"
  | "data-route.import"
  | "data-route.import-and-duplicate"
  | "data-route.item-type.character"
  | "data-route.item-type.scene"
  | "data-route.last-updated"
  | "data-route.meta.description"
  | "data-route.meta.title"
  | "data-route.name"
  | "data-route.none"
  | "data-route.selected-size"
  | "data-route.size"
  | "data-route.total-size"
  | "data-route.type"
  | "dice-fab.pool"
  | "dice-fab.roll"
  | "dice-route.meta.description"
  | "dice-route.meta.title"
  | "docs.book-of-monsters.description"
  | "docs.book-of-monsters.title"
  | "docs.cheat-sheet.description"
  | "docs.cheat-sheet.title"
  | "docs.dials.description"
  | "docs.dials.title"
  | "docs.fari-wiki.description"
  | "docs.fari-wiki.title"
  | "docs.fate-accelerated.description"
  | "docs.fate-accelerated.title"
  | "docs.fate-adversary-toolkit.description"
  | "docs.fate-adversary-toolkit.title"
  | "docs.fate-condensed.description"
  | "docs.fate-condensed.title"
  | "docs.fate-core.description"
  | "docs.fate-core.title"
  | "docs.fate-stunts.description"
  | "docs.fate-stunts.title"
  | "docs.fate-system-toolkit.description"
  | "docs.fate-system-toolkit.title"
  | "docs.success-with-style.description"
  | "docs.success-with-style.title"
  | "donation.kofi"
  | "donation.patreon"
  | "draw-route.meta.description"
  | "draw-route.meta.title"
  | "home-route.cards.blog.cta"
  | "home-route.cards.blog.description"
  | "home-route.cards.blog.title"
  | "home-route.cards.characters.cta"
  | "home-route.cards.characters.description"
  | "home-route.cards.characters.title"
  | "home-route.cards.data.cta"
  | "home-route.cards.data.description"
  | "home-route.cards.data.title"
  | "home-route.cards.dice-pool.cta"
  | "home-route.cards.dice-pool.description"
  | "home-route.cards.dice-pool.title"
  | "home-route.cards.dice-roller.cta"
  | "home-route.cards.dice-roller.description"
  | "home-route.cards.dice-roller.title"
  | "home-route.cards.play-solo.cta"
  | "home-route.cards.play-solo.description"
  | "home-route.cards.play-solo.title"
  | "home-route.cards.scenes.cta"
  | "home-route.cards.scenes.description"
  | "home-route.cards.scenes.title"
  | "home-route.cards.srds.cta"
  | "home-route.cards.srds.description"
  | "home-route.cards.srds.title"
  | "home-route.cards.wiki.cta"
  | "home-route.cards.wiki.description"
  | "home-route.cards.wiki.title"
  | "home-route.header.stats"
  | "home-route.header.subtitle"
  | "home-route.header.title"
  | "home-route.meta.description"
  | "home-route.meta.title"
  | "home-route.play-offline.button"
  | "home-route.play-offline.description"
  | "home-route.play-offline.title"
  | "home-route.play-online.button"
  | "home-route.play-online.description"
  | "home-route.play-online.title"
  | "home-route.sections.getting-started.sub-title"
  | "home-route.sections.getting-started.title"
  | "home-route.sections.join-community.cta"
  | "home-route.sections.join-community.sub-title"
  | "home-route.sections.join-community.title"
  | "home-route.sections.open-source.cta"
  | "home-route.sections.open-source.description"
  | "home-route.sections.open-source.sub-title"
  | "home-route.sections.open-source.title"
  | "home-route.sections.patreon.title"
  | "home-route.sections.tools.title"
  | "home-route.support-fari.description"
  | "home-route.support-fari.title"
  | "index-card.collapse"
  | "index-card.duplicate"
  | "index-card.expand"
  | "index-card.mark-private"
  | "index-card.mark-public"
  | "index-card.pin"
  | "index-card.remove"
  | "index-card.remove-confirmation"
  | "index-card.reset"
  | "index-card.reset-confirmation"
  | "index-card.unpin"
  | "manager.deleted"
  | "manager.import"
  | "manager.leave-without-saving"
  | "manager.new"
  | "manager.no-items"
  | "manager.undo"
  | "manager.ungrouped"
  | "menu.about"
  | "menu.characters"
  | "menu.dice"
  | "menu.scenes"
  | "menu.srds"
  | "oracle-route.meta.description"
  | "oracle-route.meta.title"
  | "oracle.value.No"
  | "oracle.value.NoAnd"
  | "oracle.value.Yes"
  | "oracle.value.YesAnd"
  | "oracle.value.YesBut"
  | "page.privacy-policy"
  | "play-route.add-aspect"
  | "play-route.add-bad-guy"
  | "play-route.add-boost"
  | "play-route.add-character-sheet"
  | "play-route.add-index-card"
  | "play-route.add-npc"
  | "play-route.clone-and-load-scene"
  | "play-route.collapse-all"
  | "play-route.connect-to-game"
  | "play-route.connected"
  | "play-route.copy-game-link"
  | "play-route.error.description1"
  | "play-route.error.description2"
  | "play-route.error.title"
  | "play-route.error.webRTC"
  | "play-route.expand-all"
  | "play-route.gm-notes"
  | "play-route.group"
  | "play-route.host-leaving-warning"
  | "play-route.join"
  | "play-route.join-error"
  | "play-route.join-error.connection-issues"
  | "play-route.load-scene"
  | "play-route.new-scene"
  | "play-route.no-aspects"
  | "play-route.players"
  | "play-route.private"
  | "play-route.public"
  | "play-route.reset-initiative"
  | "play-route.reset-scene-confirmation"
  | "play-route.save-scene"
  | "play-route.scene-name"
  | "play-route.scene-saved"
  | "play-route.sort"
  | "play-route.sort-options.groups-first"
  | "play-route.sort-options.none"
  | "play-route.sort-options.pinned-first"
  | "play-route.what-is-your-name"
  | "player-row.load-character-sheet-dialog.description"
  | "player-row.load-character-sheet-dialog.load"
  | "player-row.load-character-sheet-dialog.load-and-duplicate"
  | "player-row.load-character-sheet-dialog.title"
  | "player-row.not-played"
  | "player-row.open-character-sheet"
  | "player-row.played"
  | "player-row.remove-player"
  | "player-row.remove-player-confirmation"
  | "player-row.swap-character-sheet"
  | "srds-route.description"
  | "srds-route.fate-srds.subtitle"
  | "srds-route.fate-srds.title"
  | "srds-route.resources.title"
  | "srds-route.title";
