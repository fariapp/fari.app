export const IndexCardSkills = {
  getSkills(
    content: string | undefined
  ): Array<{ label: string; modifier: string }> {
    const div = document.createElement("DIV");
    div.innerHTML = content ?? "";
    const clickableSkills = div.textContent?.match(SkillRegex);

    if (!clickableSkills) {
      return [];
    }
    return clickableSkills.map((skill) => {
      const [label, modifier] = skill.split(":");
      const trimmedLabel = label.trim();
      const trimmedModifier = modifier.trim();
      return {
        label: trimmedLabel,
        modifier: trimmedModifier,
      };
    });
  },
};
const SkillRegex = /^.+:\s?\-?\d+/gm;
